from flask import Flask, request, jsonify
import requests
import io
import cv2
import tempfile




app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

def analyze_video(video_path, frame_rate=1):

    images = []

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)

    frame_interval = int(fps * frame_rate)
    frame_num = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_num % frame_interval == 0:
            success, buffer = cv2.imencode('.jpg', frame)
            if success:
                images.append(io.BytesIO(buffer.tobytes()))
        frame_num += 1

    cap.release()

    return images


@app.route('/', methods=['GET', 'POST'])
def process():
    if request.method == 'POST':
        #get uploaded video
        if 'video' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400
        video_file = request.files['video']

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        video_file.save(temp_file.name)

        base_url = request.form.get('Url')
        if not base_url:
            return jsonify({'message': 'Missing Url field in form data'}), 400
        target_url = f"{base_url}/video-predict"

        try:
            # payload to send

            images = analyze_video(temp_file.name, frame_rate=1)


            files = []
            i = 0

            for i, image in enumerate(images):
                # The first string ('video') must match the expected form field name on the receiver
                files.append(('video', (f"img{i}.jpg", image, "image/jpeg")))

            payload = {'message': 'Send Video'}

            response = requests.post(target_url, files=files, data=payload, timeout=50)
            data = response.json()

            return jsonify({'message': f"{data['reply']}"})

        except requests.exceptions.RequestException as e:
            return jsonify({"status": "error", "error": str(e)}), 500

    else:
        return "Backend is from Video"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
