from flask import Flask, request, jsonify
import requests

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

@app.route('/', methods=['GET', 'POST'])
def process():
    if request.method == 'POST':
        #get uploaded image
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400
        image_file = request.files['image']
        filename = image_file.filename

        #process the image
        # try:
        #     image = Image.open(image_file).convert("RGB")
        # except UnidentifiedImageError:
        #     return jsonify({'message': f"Invalid Image file: {filename}!"})
        
        base_url = request.form.get('Url')
        print(type(base_url))
        if not base_url:
            return jsonify({'message': 'Missing Url field in form data'}), 400
        target_url = f"{base_url}/image-predict"

        try:
            # Example payload to send
            files = {'image': (filename, image_file, image_file.content_type)}
            payload = {'message': 'Send Image'}

            print(target_url)
            # Send POST request to another Flask app
            response = requests.post(target_url, files=files, data=payload, timeout=5)
            data = response.json()

            return jsonify({'message': f"{data['reply']}"})

        except requests.exceptions.RequestException as e:
            return jsonify({"status": "error", "error": str(e)}), 500

        # show the user the model is being predicted
        return jsonify({'message': f"Predicting {filename}!"})
    
    else:
        return "Backend is from image!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
