import requests
import json
from typing import Dict, Any

# Define the internal service endpoints - NO /predict/ path, just root
INFERENCE_ENDPOINTS = {
    "audio": "http://backend-audio-predict-service:5000",
    "video": "http://backend-video-predict-service:5000",
    "image": "http://backend-image-predict-service:5000",
    "text": "http://backend-text-predict-service:5000",
}

def run_inference(media_type: str, file_bytes: bytes) -> Dict[str, Any]:
    """
    Routes the file bytes to the correct microservice for actual model inference.
    """
    endpoint = INFERENCE_ENDPOINTS.get(media_type)
    if not endpoint:
        raise ValueError(f"No prediction service defined for media type: {media_type}")

    # Prepare files based on media type
    if media_type == "image":
        files = {'image': (f"temp.jpg", file_bytes, 'image/jpeg')}
    elif media_type == "text":
        files = {'text': (f"temp.txt", file_bytes, 'text/plain')}
    elif media_type == "video":
        files = {'video': (f"temp.mp4", file_bytes, 'video/mp4')}
    elif media_type == "audio":
        files = {'audio': (f"temp.mp3", file_bytes, 'audio/mpeg')}
    else:
        files = {'file': (f"temp.{media_type}", file_bytes)}

    try:
        response = requests.post(endpoint, files=files, timeout=120)
        response.raise_for_status()
        result = response.json()
        
        # Extract reply/message field
        reply = result.get('reply', result.get('message', ''))
        
        # Try to parse confidence from the reply
        confidence = None
        if 'Confidence:' in reply:
            try:
                confidence = float(reply.split('Confidence:')[1].strip().split()[0])
            except:
                pass
        elif 'Prediction:' in reply:
            try:
                import re
                numbers = re.findall(r'\d+\.?\d*', reply.split('Prediction:')[1])
                if numbers:
                    confidence = float(numbers[0])
            except:
                pass
        
        return {"confidence": confidence, "prediction": reply}

    except requests.exceptions.RequestException as e:
        raise ConnectionError(f"Failed to connect to {media_type} prediction service: {e}")
    except Exception as e:
        raise e
