import json
import logging
import time
import datetime
from typing import Dict, Any, List, Tuple
from app.core.config import settings

logger = logging.getLogger("pulseiq.ai")

# Dynamic Clients setup
gemini_enabled = False
groq_enabled = False

# Provider health status dictionary
provider_status = {
    "gemini": {
        "healthy": True,
        "consecutive_failures": 0,
        "last_failure_reason": None,
        "last_check_time": None
    },
    "groq": {
        "healthy": True,
        "consecutive_failures": 0,
        "last_failure_reason": None,
        "last_check_time": None
    }
}

# Log API key presence and state
logger.info(f"Loading AI Provider credentials...")
gemini_key_exists = bool(settings.GEMINI_API_KEY)
groq_key_exists = bool(settings.GROQ_API_KEY)
logger.info(f"Gemini API key configured: {gemini_key_exists}")
logger.info(f"Groq API key configured: {groq_key_exists}")

if gemini_key_exists and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        import google.generativeai as genai
        # Show masked API key prefix for troubleshooting
        masked_key = settings.GEMINI_API_KEY[:6] + "..." if len(settings.GEMINI_API_KEY) > 6 else "Configured"
        logger.info(f"Initializing Gemini client with key prefix: {masked_key}")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        gemini_enabled = True
        logger.info("Gemini client successfully configured and enabled.")
    except Exception as e:
        logger.error(f"Error configuring Gemini client: {e}", exc_info=True)
        provider_status["gemini"]["healthy"] = False
        provider_status["gemini"]["last_failure_reason"] = str(e)
else:
    logger.warning("Gemini API key is missing or using placeholder value. Gemini service will be disabled.")

if groq_key_exists and settings.GROQ_API_KEY != "your_groq_api_key_here":
    try:
        from groq import Groq
        masked_key = settings.GROQ_API_KEY[:6] + "..." if len(settings.GROQ_API_KEY) > 6 else "Configured"
        logger.info(f"Initializing Groq client with key prefix: {masked_key}")
        groq_client = Groq(api_key=settings.GROQ_API_KEY)
        groq_enabled = True
        logger.info("Groq client successfully configured and enabled.")
    except Exception as e:
        logger.error(f"Error configuring Groq client: {e}", exc_info=True)
        provider_status["groq"]["healthy"] = False
        provider_status["groq"]["last_failure_reason"] = str(e)
else:
    logger.warning("Groq API key is missing or using placeholder value. Groq fallback service will be disabled.")


def _call_gemini(prompt: str, json_mode: bool = False, media_data: Dict[str, Any] = None) -> str:
    """Helper to execute Gemini API generation content with timeout, retries, and health tracking."""
    logger.info(f"Initiating Gemini API call (model: gemini-2.5-flash). Prompt size: {len(prompt)} chars")
    import google.generativeai as genai
    model_name = "gemini-2.5-flash"
    model = genai.GenerativeModel(model_name)
    generation_config = {"response_mime_type": "application/json"} if json_mode else {}

    contents = [prompt]
    if media_data:
        contents.append(media_data)

    attempts = 2
    for attempt in range(1, attempts + 1):
        try:
            logger.info(f"Attempt {attempt}/{attempts} to call Gemini API...")
            response = model.generate_content(
                contents,
                generation_config=generation_config,
                request_options={"timeout": 60.0}
            )
            # Update health status
            provider_status["gemini"]["healthy"] = True
            provider_status["gemini"]["consecutive_failures"] = 0
            provider_status["gemini"]["last_check_time"] = datetime.datetime.utcnow().isoformat()
            logger.info("Gemini API call completed successfully.")
            return response.text
        except Exception as e:
            logger.warning(f"Attempt {attempt}/{attempts} failed calling Gemini API: {e}")
            if attempt == attempts:
                provider_status["gemini"]["consecutive_failures"] += 1
                if provider_status["gemini"]["consecutive_failures"] >= 2:
                    provider_status["gemini"]["healthy"] = False
                provider_status["gemini"]["last_failure_reason"] = str(e)
                provider_status["gemini"]["last_check_time"] = datetime.datetime.utcnow().isoformat()
                raise e
            time.sleep(1)


def _call_groq(prompt: str, json_mode: bool = False) -> str:
    """Helper to execute Groq API completion with retries and health tracking."""
    logger.info(f"Initiating Groq API call (model: llama-3.3-70b-versatile). Prompt size: {len(prompt)} chars")
    model = "llama-3.3-70b-versatile"
    messages = [
        {"role": "system", "content": "You are a clinical AI diagnostic engine designed for PulseIQ AI."},
        {"role": "user", "content": prompt}
    ]
    response_format = {"type": "json_object"} if json_mode else None

    attempts = 2
    for attempt in range(1, attempts + 1):
        try:
            logger.info(f"Attempt {attempt}/{attempts} to call Groq API...")
            chat_completion = groq_client.chat.completions.create(
                messages=messages,
                model=model,
                response_format=response_format,
                temperature=0.2,
                timeout=30.0
            )
            # Update health status
            provider_status["groq"]["healthy"] = True
            provider_status["groq"]["consecutive_failures"] = 0
            provider_status["groq"]["last_check_time"] = datetime.datetime.utcnow().isoformat()
            logger.info("Groq API call completed successfully.")
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.warning(f"Attempt {attempt}/{attempts} failed calling Groq API: {e}")
            if attempt == attempts:
                provider_status["groq"]["consecutive_failures"] += 1
                if provider_status["groq"]["consecutive_failures"] >= 2:
                    provider_status["groq"]["healthy"] = False
                provider_status["groq"]["last_failure_reason"] = str(e)
                provider_status["groq"]["last_check_time"] = datetime.datetime.utcnow().isoformat()
                raise e
            time.sleep(1)


def check_provider_health(provider_name: str) -> bool:
    """Explicit health check routine for the specified provider."""
    test_prompt = "Say OK"
    if provider_name == "gemini":
        if not gemini_enabled:
            return False
        try:
            _call_gemini(test_prompt)
            return True
        except Exception:
            return False
    elif provider_name == "groq":
        if not groq_enabled:
            return False
        try:
            _call_groq(test_prompt)
            return True
        except Exception:
            return False
    return False


def _execute_ai_prompt(prompt: str, json_mode: bool = False, media_data: Dict[str, Any] = None) -> Tuple[str, str]:
    """Executes prompt via Gemini with auto-fallback to Groq.
    Returns a Tuple of (provider_name, response_text).
    Raises error if both fail.
    """
    errors = []

    # Evaluate Gemini health and status
    use_gemini = gemini_enabled and provider_status["gemini"]["healthy"]
    if gemini_enabled and not provider_status["gemini"]["healthy"]:
        logger.warning("Gemini is marked unhealthy in status monitor.")
        if not groq_enabled:
            logger.info("Groq is not configured/enabled. Attempting Gemini despite unhealthy status.")
            use_gemini = True

    if use_gemini:
        try:
            logger.info("Attempting primary generation via Gemini API...")
            response_text = _call_gemini(prompt, json_mode, media_data)
            return "gemini", response_text
        except Exception as e:
            logger.warning(f"Primary Gemini API call failed: {e}. Attempting failover to Groq...")
            errors.append(f"Gemini error: {str(e)}")

    # Fallback to Groq
    if groq_enabled:
        try:
            logger.info("Attempting fallback generation via Groq API...")
            response_text = _call_groq(prompt, json_mode)
            return "groq", response_text
        except Exception as ex:
            logger.error(f"Fallback Groq API call also failed: {ex}")
            errors.append(f"Groq error: {str(ex)}")

    raise ValueError(f"All AI providers failed or are not configured. Details: {'; '.join(errors)}")


class AIService:
    @staticmethod
    def generate_chat_response(message: str, chat_history: List[Dict[str, str]] = None) -> Tuple[str, Dict[str, Any]]:
        """Generates conversational response and maps structured triage info."""
        prompt = f"""
        You are 'PulseIQ AI Copilot', a clinical-grade medical assistant. 
        A patient has asked you the following: "{message}"
        
        Provide a helpful, professional, and empathetic clinical response.
        Additionally, extract structured safety metadata from the dialogue.
        
        You MUST return your answer as a JSON object with this exact schema:
        {{
            "response": "Your friendly, conversational response to the user here. Clean up markdown text.",
            "structured_data": {{
                "recommended_actions": ["List of recommended clinical/health next steps, e.g. increase hydration, check blood pressure, consult general practitioner"],
                "potential_conditions": ["List of potential diagnoses/conditions discussed or implied, if any. Leave empty if general conversation"],
                "severity": "Low"
            }}
        }}
        
        Note: The 'severity' field must be 'Low', 'Medium', or 'High'.
        """
        
        try:
            provider, ai_output = _execute_ai_prompt(prompt, json_mode=True)
            data = json.loads(ai_output)
            return data["response"], data.get("structured_data", {})
        except Exception as e:
            logger.error(f"AI Service error in generate_chat_response: {e}", exc_info=True)
            raise e

    @staticmethod
    def analyze_symptoms(symptoms: str) -> Tuple[List[str], List[str], str]:
        """Runs clinical symptom checker triage and predicts conditions."""
        prompt = f"""
        Analyze the following symptom log from a patient: "{symptoms}"
        
        Predict potential conditions, list critical recommendations, and assign a triage severity level.
        
        You MUST return your answer as a JSON object with this exact schema:
        {{
            "possible_conditions": ["Condition A", "Condition B"],
            "recommendations": ["Recommendation 1", "Recommendation 2"],
            "severity": "Low"
        }}
        
        Note: 'severity' must be one of 'Low', 'Medium', or 'High'. High severity indicates warning flags requiring urgent care.
        """
        
        try:
            provider, ai_output = _execute_ai_prompt(prompt, json_mode=True)
            data = json.loads(ai_output)
            return data.get("possible_conditions", []), data.get("recommendations", []), data.get("severity", "Low")
        except Exception as e:
            logger.error(f"AI Service error in analyze_symptoms: {e}", exc_info=True)
            raise e

    @staticmethod
    def analyze_report(extracted_text: str, file_bytes: bytes = None, mime_type: str = None) -> Dict[str, Any]:
        """Parses extracted lines from PDF health documents and translates jargon."""
        media_data = None
        if file_bytes and mime_type and mime_type.startswith("image/"):
            media_data = {"mime_type": mime_type, "data": file_bytes}

        prompt = f"""
        You are a clinical OCR analysis engine. Simplify the following medical report:
        {"[Text Content]" if not media_data else "[Image Document]"}
        {extracted_text}
        
        Provide a clinical summary, key findings, list of abnormal values (markers that are high, low, or out of range), list of recommendations, and a risk assessment.
        
        You MUST return your answer as a JSON object with this exact schema:
        {{
            "practitioner_name": "Doctor Name (if found, otherwise null)",
            "facility_name": "Clinic/Hospital Name (if found, otherwise null)",
            "summary": "An easy-to-understand translation of the findings.",
            "key_findings": ["Finding A", "Finding B"],
            "abnormal_values": ["Abnormal Marker A: Value (e.g. LDL: 142 mg/dL - High)", "Abnormal Marker B: Value"],
            "risk_level": "Low",
            "recommendations": ["Action A", "Action B"]
        }}
        
        Note: 'risk_level' must be 'Low', 'Medium', or 'High'.
        """
        
        try:
            provider, ai_output = _execute_ai_prompt(prompt, json_mode=True, media_data=media_data)
            return json.loads(ai_output)
        except Exception as e:
            logger.error(f"AI Service error in analyze_report: {e}", exc_info=True)
            raise e
