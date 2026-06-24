import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, SessionLocal, Base, get_db
from app.core.security import verify_clerk_token, get_current_user
from app.core.websockets import manager
from app.models.user import User

# Router imports
from app.api.v1.auth import router as auth_router
from app.api.v1.medications import router as medications_router
from app.api.v1.metrics import router as metrics_router
from app.api.v1.reports import router as reports_router
from app.api.v1.family import router as family_router
from app.api.v1.sos import router as sos_router
from app.api.v1.ai import router as ai_router
from app.api.v1.symptoms import router as symptoms_router
from app.api.v1.location import router as location_router
from app.api.v1.nearby import router as nearby_router
from app.api.v1.watches import router as watches_router
from app.api.v1.webhooks import router as webhooks_router

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pulseiq.main")

# Auto-create database tables on startup (highly convenient for local SQLite testing)
# In production PostgreSQL deployments, Alembic migrations run head migrations
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Error during automatic database tables creation: {e}")

app = FastAPI(
    title="PulseIQ API Service",
    description="Clinical-grade wellness telemetry & AI assistant backend",
    version="2.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 API routes
api_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_prefix)
app.include_router(medications_router, prefix=api_prefix)
app.include_router(metrics_router, prefix=api_prefix)
app.include_router(reports_router, prefix=api_prefix)
app.include_router(family_router, prefix=api_prefix)
app.include_router(sos_router, prefix=api_prefix)
app.include_router(ai_router, prefix=api_prefix)
app.include_router(symptoms_router, prefix=api_prefix)
app.include_router(location_router, prefix=api_prefix)
app.include_router(nearby_router, prefix=api_prefix)
app.include_router(watches_router, prefix=api_prefix)
app.include_router(webhooks_router, prefix=api_prefix)

# Setup local static directory mounting to serve uploaded/generated report files
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def health_check():
    """Simple API health check endpoint."""
    return {
        "status": "healthy",
        "service": "pulseiq-ai-backend",
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/health/db")
def health_db_check(db = Depends(get_db)):
    """Validates the Neon PostgreSQL connection and runs insert and read verification operations."""
    import uuid
    from app.models.user import User
    
    test_user_id = str(uuid.uuid4())
    test_clerk_id = f"test_clerk_{test_user_id[:8]}"
    test_email = f"test_{test_user_id[:8]}@example.com"
    test_name = "Database Verification Test User"
    
    try:
        # 1. Insert Operation
        new_user = User(
            id=test_user_id,
            clerk_id=test_clerk_id,
            email=test_email,
            full_name=test_name,
            role="tester"
        )
        db.add(new_user)
        db.commit()
        
        # 2. Read Operation
        queried_user = db.query(User).filter(User.id == test_user_id).first()
        if not queried_user or queried_user.full_name != test_name:
            raise ValueError("Read verification failed or data mismatch.")
            
        # 3. Clean up
        db.delete(queried_user)
        db.commit()
        
        return {
            "status": "success",
            "message": "Neon PostgreSQL connection validated successfully.",
            "operations": {
                "insert": "verified",
                "read": "verified",
                "delete": "verified"
            },
            "database_url_schema": settings.DATABASE_URL.split("://")[0]
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Database health check failed: {str(e)}"
        )

@app.get("/api/user/me")
def get_authenticated_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieves authenticated user profile synced from Clerk."""
    return {
        "id": current_user.id,
        "clerk_id": current_user.clerk_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "created_at": current_user.created_at
    }

@app.websocket("/ws/health")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    """Establishes active biometric stream connection channels verified with Clerk tokens."""
    try:
        # Verify Clerk token passed in query parameters
        payload = verify_clerk_token(token)
        clerk_id = payload.get("sub")
        
        if not clerk_id:
            logger.warning("WebSocket token payload missing sub claim.")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
            
        # Resolve user ID mapping from database context
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.clerk_id == clerk_id).first()
            if not user:
                # Fallback user sync if token resolved but webhook delayed
                email = payload.get("email") or f"clerk_{clerk_id}@example.com"
                user = User(
                    clerk_id=clerk_id, 
                    email=email.lower(), 
                    full_name=payload.get("name") or email.split("@")[0],
                    role="patient"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            user_id = str(user.id)
        finally:
            db.close()
            
        # Connect websocket to manager registry
        await manager.connect(user_id, websocket)
        logger.info(f"WebSocket linked for user_id: {user_id}")
        
        # Block and listen for client connection drops
        while True:
            # Sockets stay open. Listen for incoming text or keep-alive packets
            data = await websocket.receive_text()
            logger.debug(f"WS client sent: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
        logger.info(f"WebSocket client disconnected: user_id={user_id}")
    except Exception as e:
        logger.error(f"WebSocket authentication/connection failure: {e}")
        try:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        except Exception:
            pass
