from flask import Flask, request, jsonify
import torch
import torch.nn.functional as F
from transformers import AutoModelForSequenceClassification, AutoTokenizer


app = Flask(__name__)

# Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load RADAR-Vicuna detector
detector = AutoModelForSequenceClassification.from_pretrained("TrustSafeAI/RADAR-Vicuna-7B")
tokenizer = AutoTokenizer.from_pretrained("TrustSafeAI/RADAR-Vicuna-7B")

detector.to(device)
detector.eval()

def classify_text(text):
    with torch.no_grad():
        # Tokenize input
        inputs = tokenizer(
            [text],
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt"
        )
        
        # Move input tensors to device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Get logits from the model
        logits = detector(**inputs).logits
        
        # Convert logits to probability
        output_probs = F.log_softmax(logits, dim=-1)[:, 0].exp().tolist()

        return output_probs

@app.route('/text-predict', methods=['GET', 'POST'])
def home():
    data = request.get_json(force=True)
    print(data)
    if not data or 'message' not in data:
        return jsonify({'reply': 'No text received!'}), 400
    
    text = data['message']

    message = classify_text(text)

    print(message)
    return jsonify({"reply": f"Prediction: {message[0]:.4f}"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
