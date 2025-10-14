from flask import Flask, request, jsonify

app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400
        image = request.files['image']
        filename = image.filename
        return jsonify({'message': f"Image '{filename}' was received successfully!"})
    else:
        return "Backend is from image!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
