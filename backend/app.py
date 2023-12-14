from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
    return "Hello, Flask!"

@app.route('/api/data', methods=['GET'])
def get_data():
    data = {'message': 'This is some data from the server'}
    return jsonify(data)

@app.route('/api/submit', methods=['POST'])
def submit_data():
    data = request.get_json()
    # Process the data received from the frontend
    # ...
    response = {'message': 'Data submitted successfully'}
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
app = Flask(__name__)

