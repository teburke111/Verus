from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "Backend is running!"

@app.route('/api/process', methods=['POST'])
def process_text():
    data = request.json
    text = data.get("text", "")
    result = text.upper()  # example processing
    return jsonify({"processed_text": result})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
