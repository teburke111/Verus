from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "Backend is from image!"

@app.route('/image-process', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'message': 'No image file provided'}), 400

    image = request.files['image']
    filename = image.filename
    print(f"Received image: {filename}")

    return jsonify({'message': f"Image '{filename}' was received successfully!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
