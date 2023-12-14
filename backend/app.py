from flask import Flask, jsonify, request
from flask_cors import CORS
import yaml

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
    # Load configurations from config.yml
    with open('config.yml', 'r') as f:
        config = yaml.safe_load(f)
    
    # Verify that the config file is valid
    assert 'debug' in config, 'debug key not found in config.yml'
    assert type(config['debug']) == bool, 'debug key must be a boolean'

    # Start the Flask server
    app.run(debug=config['debug'])


app = Flask(__name__)

