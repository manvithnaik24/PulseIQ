import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.chat import ChatMessage
from app.schemas.chat import ChatMessageResponse, ChatPromptRequest, ChatPromptResponse, ChatStructuredData
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Retrieves conversation logs. 
    Bot dialogue messages are saved as JSON strings to match frontend parsers.
    """
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.asc()).limit(limit).all()
    
    return messages

@router.post("/chat", response_model=ChatPromptResponse)
def run_assistant_chat(
    prompt_in: ChatPromptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submits conversational prompt to Gemini AI and logs the dialog logs."""
    import logging
    logger = logging.getLogger("pulseiq.ai")
    logger.info(f"POST /api/v1/ai/chat requested by User ID: {current_user.id}. Message prompt size: {len(prompt_in.message)} chars")
    
    # 1. Log User Message
    user_msg = ChatMessage(
        user_id=current_user.id,
        sender="user",
        message=prompt_in.message,
        thread_id="default_thread"
    )
    db.add(user_msg)
    db.flush() # populate ID and timestamp
    
    # 2. Call AI Service (Gemini with Groq Fallback)
    response_text, structured_data = AIService.generate_chat_response(prompt_in.message)
    
    # 3. Format bot message payload as a JSON-encoded string to match frontend parsing requirements
    bot_message_content = json.dumps({
        "response": response_text,
        "structured_data": structured_data
    })
    
    # 4. Log Bot Message
    bot_msg = ChatMessage(
        user_id=current_user.id,
        sender="bot",
        message=bot_message_content,
        structured_data=structured_data,
        thread_id="default_thread"
    )
    db.add(bot_msg)
    db.commit()
    
    return ChatPromptResponse(
        response=response_text,
        structured_data=ChatStructuredData(
            recommended_actions=structured_data.get("recommended_actions", []),
            potential_conditions=structured_data.get("potential_conditions", []),
            severity=structured_data.get("severity", "Low")
        )
    )

@router.post("/test-gemini")
def test_gemini_connection(
    prompt_request: ChatPromptRequest,
    current_user: User = Depends(get_current_user)
):
    """Test endpoint to verify connection and failover logic."""
    try:
        from app.services.ai_service import _execute_ai_prompt, provider_status
        provider, response_text = _execute_ai_prompt(prompt_request.message)
        return {
            "provider": provider,
            "response": response_text,
            "status_monitor": provider_status
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI API Call Failed: {str(e)}"
        )
