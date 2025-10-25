from flask import Flask, request, jsonify
import requests
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB


@app.route('/text-process', methods=['GET', 'POST'])
def process():
    if request.method == 'POST':
        #get uploaded text file
        if 'text' not in request.files:
            return jsonify({'message': 'No image text provided'}), 400
        text_file = request.files['text']
        
        #get baseUrl backend request
        base_url = request.form.get('Url')
        print(type(base_url))

        #get Url for request
        if not base_url:
            return jsonify({'message': 'Missing Url field in form data'}), 400
        target_url = f"{base_url}/text-predict"

        #get text from text file
        text = text_file.read().decode('utf-8')

        print(text)


        try:
            # Example payload to send
            payload = {'message': text}

            print(target_url)
            # Send POST request to another Flask app
            response = requests.post(target_url, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()

            print(data)

            return jsonify({'message': f"{data['reply']}"})

        except requests.exceptions.RequestException as e:
            return jsonify({"status": "error", "error": str(e)}), 500
    
    else:
        return "Backend is from text!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
