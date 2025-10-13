from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "Backend is running from text!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
