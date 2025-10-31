from flask import Flask, request, jsonify
from transformers import AutoImageProcessor, SiglipForImageClassification
import torch
import cv2
from PIL import Image, UnidentifiedImageError

app = Flask(__name__)

# Load the pretrained model from Hugging Face
model_name = "prithivMLmods/deepfake-detector-model-v1"
processor = AutoImageProcessor.from_pretrained(model_name)
model = SiglipForImageClassification.from_pretrained(model_name)

def classify_image(img_file):
    try:
        image = Image.open(img_file).convert("RGB")
    except UnidentifiedImageError:
        return None  # skip invalid images
    
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()
    
    id2label = {"0": "fake", "1": "real"}
    result = {id2label[str(i)]: round(probs[i] * 100, 2) for i in range(len(probs))}
    return result

@app.route('/', methods=['GET', 'POST'])
def home():

    if 'video' not in request.files:
        return jsonify({'reply': 'No image received!'}), 400
    video_files = request.files.getlist('video')

    i = 0
    total = 0
    for video_file in video_files:
        total = classify_image(video_file)["fake"] + total
        i += 1

    odds = total/i
    

    if odds > 50:
        classify = "AI-Generated"
    else:
        classify = "Real Video"
        odds = odds + 50

    return jsonify({"reply": f"Prediction: {classify} Confidence: {odds}"})



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
