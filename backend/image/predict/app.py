from flask import Flask, request, jsonify
from transformers import AutoImageProcessor, SiglipForImageClassification
import torch
from PIL import Image, UnidentifiedImageError

app = Flask(__name__)

# Load the pretrained model from Hugging Face
model_name = "prithivMLmods/deepfake-detector-model-v1"
processor = AutoImageProcessor.from_pretrained(model_name)
model = SiglipForImageClassification.from_pretrained(model_name)

def classify_image(img_path):
    try:
        image = Image.open(img_path).convert("RGB")
    except UnidentifiedImageError:
        print(f"Skipping invalid image: {img_path}")
        return None
    
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()

    id2label = {"0": "Fake", "1": "Real"}
    result = {id2label[str(i)]: round(probs[i] * 100, 2) for i in range(len(probs))}
    max_label = max(result, key=result.get)
    max_prob = result[max_label]

    final_result = [max_label, max_prob]
    return final_result

@app.route('/', methods=['GET', 'POST'])
def home():
    if 'image' not in request.files:
        return jsonify({'reply': 'No image received!'}), 400
    image_file = request.files['image']
    filename = image_file.filename

    message = classify_image(image_file)
    return jsonify({"reply": f"Prediction: {message[0]} Confidence: {message[1]}"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
