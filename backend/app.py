import json
import yaml
import os
from llm import LLMStoryteller
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/")
def index():
    return "Hello, Flask!"


@app.route("/api/data", methods=["GET"])
def get_data():
    data = {"message": "This is some data from the server"}
    return jsonify(data)


# TODO: Change how the image is retrieved, and maybe change what's returned

@app.route("/api/story", methods=["GET"])
def get_story():
    # Load configurations from config.yml
    with open("config.yml", "r") as f:
        config = yaml.safe_load(f)
    # Get drawing
    drawing_file = "superhero.jpeg" # Replace with uploaded file
    drawing_path = os.path.join(config["app"]["upload_folder"], drawing_file)
    # Send drawing to llm
    llm = LLMStoryteller()
    json_content = llm.get_story_from_drawing(drawing_path)
    # Create json file with the result from llm
    json_file = os.path.join(config["app"]["json_folder"], f"{drawing_file.split('.')[0]}.json")
    with open(json_file, 'w') as f:
        json.dump(json_content, f, indent=4)
    # Return json file with the story
    data = {"story": json_content["story"]}
    return jsonify(data)



# TODO: Doesn't work with the frontend yet
@app.route("/api/upload", methods=["POST"])
def upload_file():
    # Load configurations from config.yml
    with open("config.yml", "r") as f:
        config = yaml.safe_load(f)

    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"})

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"})

    if file and allowed_file(file.filename, config["app"]["allowed_extensions"]):
        filename = secure_filename(file.filename)
        file.save(os.path.join(config["app"]["upload_folder"], filename))
        return jsonify({"message": "File uploaded successfully"})
    else:
        return jsonify({"error": "Invalid file type"})


def allowed_file(filename, allowed_extensions):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions


if __name__ == "__main__":
    # Load configurations from config.yml
    with open("config.yml", "r") as f:
        config = yaml.safe_load(f)

    # Verify that the config file is valid
    assert config["app"]["debug"], "debug key not found in config.yml"
    assert type(config["app"]["debug"]) == bool, "debug key must be a boolean"

    # Start the Flask server
    app.run(debug=config["app"]["debug"])

app = Flask(__name__)