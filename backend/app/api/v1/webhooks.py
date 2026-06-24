import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from svix.webhooks import Webhook, WebhookVerificationError

from app.api.deps import get_db
from app.core.config import settings
from app.models.user import User

logger = logging.getLogger("pulseiq.webhooks")
router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/clerk")
async def process_clerk_webhook(request: Request, db: Session = Depends(get_db)):
    """Receives user.created/updated events from Clerk and synchronizes to database."""
    headers = request.headers
    body = await request.body()
    
    # Verify signature
    secret = settings.CLERK_WEBHOOK_SECRET
    if not secret or secret == "whsec_yourclerkwebhooksigningsecret":
        logger.warning("CLERK_WEBHOOK_SECRET is not configured. Webhook verification is bypassed.")
    else:
        svix_id = headers.get("svix-id")
        svix_timestamp = headers.get("svix-timestamp")
        svix_signature = headers.get("svix-signature")
        
        if not all([svix_id, svix_timestamp, svix_signature]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Svix signature headers."
            )
            
        try:
            wh = Webhook(secret)
            # Verify body payload bytes
            wh.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature
            })
        except WebhookVerificationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid Webhook signature: {e}"
            )
            
    # Process webhook payload data
    try:
        payload = json.loads(body.decode("utf-8"))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid JSON body: {e}"
        )
        
    event_type = payload.get("type")
    data = payload.get("data", {})
    
    logger.info(f"Received Clerk Webhook Event: {event_type}")
    
    if event_type in ["user.created", "user.updated"]:
        clerk_id = data.get("id")
        if not clerk_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event payload missing user ID."
            )
            
        # Parse email
        email = None
        email_addresses = data.get("email_addresses", [])
        if email_addresses:
            email = email_addresses[0].get("email_address")
        if not email:
            email = f"clerk_{clerk_id}@example.com"
            
        # Parse full name
        first_name = data.get("first_name") or ""
        last_name = data.get("last_name") or ""
        full_name = f"{first_name} {last_name}".strip() or email.split("@")[0]
        
        # Read profile parameters from metadata
        public_metadata = data.get("public_metadata", {})
        age = public_metadata.get("age") or 28
        weight = public_metadata.get("weight") or 70.0
        height = public_metadata.get("height") or 175.0
        blood_group = public_metadata.get("blood_group") or "O+"
        
        # Sync User details to PostgreSQL DB
        user = db.query(User).filter(User.clerk_id == clerk_id).first()
        if not user:
            user = User(clerk_id=clerk_id)
            
        user.email = email.lower()
        user.full_name = full_name
        user.age = age
        user.weight = weight
        user.height = height
        user.blood_group = blood_group
        
        db.add(user)
        db.commit()
        logger.info(f"Synchronized Clerk user profile in DB: {user.email}")
        
    return {"status": "success", "message": f"Webhook processed successfully: {event_type}"}
