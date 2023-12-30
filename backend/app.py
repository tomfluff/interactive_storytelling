from flask import Flask, jsonify, request
from flask_cors import CORS
import yaml

from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/")
def index():
    return "Hello, Flask!"


@app.route("/api/data", methods=["GET"])
def get_data():
    data = {"message": "This is some data from the server"}
    return jsonify(data)


# TODO: move to config.yml
UPLOAD_FOLDER = "/path/to/upload/folder"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"})

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"})

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        return jsonify({"message": "File uploaded successfully"})
    else:
        return jsonify({"error": "Invalid file type"})


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


if __name__ == "__main__":
    # Load configurations from config.yml
    with open("config.yml", "r") as f:
        config = yaml.safe_load(f)

    # Verify that the config file is valid
    assert "debug" in config, "debug key not found in config.yml"
    assert type(config["debug"]) == bool, "debug key must be a boolean"

    # Start the Flask server
    app.run(debug=config["debug"])

app = Flask(__name__)
