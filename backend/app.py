import tempfile
import json
import sys
import time
import yaml
import os
from llm import LLMStoryteller
from flask import Flask, jsonify, request, send_file, Response, stream_with_context
from flask_cors import CORS
import uuid


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import base64_image_url, save_base64_image, check_allowed_ext

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/")
def index():
    return "Hello, Flask!"


@app.route("/api/session", methods=["GET"])
def new_session():
    """
    Create a new session and return it.
    Session includes an id and the time it was created.
    """
    try:
        # Load configurations from config.yml
        with open("config.yml", "r") as f:
            config = yaml.safe_load(f)
        # Create a session id
        session = {
            "id": uuid.uuid4(),
            "init_time": time.time(),
        }
        # Return the session
        return jsonify(session), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# NOTE: We do not save sessions at the moment [Yotam]
@app.route("/api/session/<session_id>", methods=["GET"])
def get_session(session_id):
    """
    Get the session with the given id.
    """
    try:
        # Load configurations from config.yml
        with open("config.yml", "r") as f:
            config = yaml.safe_load(f)
        # Create a json file with the session id
        json_file = os.path.join(config["app"]["json_folder"], f"{session_id}.json")
        with open(json_file, "r") as f:
            data = json.load(f)
        # Return the session id
        return jsonify(data), 200
    except FileNotFoundError:
        return jsonify({"error": "Session not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# NOTE: We do not save sessions at the moment [Yotam]
@app.route("/api/session/<session_id>", methods=["POST"])
def update_session(session_id):
    """
    Update the session with the given id.
    """
    try:
        # Load configurations from config.yml
        with open("config.yml", "r") as f:
            config = yaml.safe_load(f)
        # Get payload data
        data = request.get_json()
        # Verify that the session id is correct
        assert data["session_id"] == session_id, "Session id does not match"
        # Update the session
        json_file = os.path.join(config["app"]["json_folder"], f"{session_id}.json")
        with open(json_file, "w") as f:
            json.dump(data, f, indent=4)
        # Return success message
        return jsonify({"message": "Session updated successfully"}), 200
    except FileNotFoundError:
        return jsonify({"error": "Session not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/drawing/<filename>", methods=["GET"])
def get_drawing(filename):
    """
    Get the drawing with the given filename.
    """
    try:
        # Load configurations from config.yml
        with open("config.yml", "r") as f:
            config = yaml.safe_load(f)
        # Create a json file with the session id
        drawing_file = os.path.join(config["app"]["upload_folder"], f"{filename}")
        # Send the image file back
        return send_file(drawing_file, mimetype="image/jpeg")
    except FileNotFoundError:
        return jsonify({"error": "Drawing not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/drawing", methods=["POST"])
def upload_and_analyze_drawing():
    """
    Upload a drawing and return the drawing analysis.
    """
    try:
        # Load configurations from config.yml
        with open("config.yml", "r") as f:
            config = yaml.safe_load(f)

        # Get the image from the multipart form data
        base64_url = request.form.get("image")
        img_data = base64_url.split(",", 1)[1]
        img_source = request.form.get("src")
        img_type = request.form.get("type")
        if not base64_url:
            return jsonify({"error": "No file provided"}), 400

        # Verify that the file is an image
        if not check_allowed_ext(img_type, config["app"]["allowed_extensions"]):
            return (
                jsonify({"error": f"Invalid file type."}),
                400,
            )

        # Save the file
        fid = uuid.uuid4()
        filename = f"{fid}.{img_type}"
        filepath = os.path.join(config["app"]["upload_folder"], filename)
        save_base64_image(img_data, filepath)

        # Get the drawing analysis
        llm = LLMStoryteller()
        drawing_analysis = llm.understand_drawing(base64_url)
        if not drawing_analysis:
            return (
                jsonify({"error": f"Failed to understand drawing."}),
                500,
            )

        return (
            jsonify(
                {
                    "id": fid,
                    "source": img_source,
                    "url": "/api/drawing/" + str(filename),
                    **drawing_analysis,
                }
            ),
            200,
        )
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/premise", methods=["POST"])
def generate_premise_options():
    """
    Get the premise choices for the drawing.
    """
    try:
        drawing = request.get_json()
        character = {
            "name": drawing["fullname"],
            "about": drawing["backstory"],
        }
        # Get the premise choices
        llm = LLMStoryteller()
        premise = llm.generate_premise(character)
        if not premise:
            return (
                jsonify({"error": f"Failed to generate premise."}),
                500,
            )
        return jsonify([{"id": i, **p} for i, p in enumerate(premise["list"])]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/read", methods=["POST"])
def read_text():
    t0 = time.time()
    try:
        data = request.get_json()
        llm = LLMStoryteller()
        return Response(
            stream_with_context(llm.send_speech_request(data["text"])),
            mimetype="audio/mp3",
        )
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    finally:
        print(f"Time taken: {time.time() - t0}")


@app.route("/api/story", methods=["GET"])
def get_new_story():
    """
    Generate a new blank story.
    """
    try:
        # Load configurations from config.yml
        with open("config.yml", "r") as f:
            config = yaml.safe_load(f)

        return (
            jsonify(
                {
                    "id": uuid.uuid4(),
                    "init_time": time.time(),
                    "parts": [],
                }
            ),
            200,
        )
    except FileNotFoundError:
        return jsonify({"error": "Session not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# NOTE: Not sure if this is all the context we need and best way to do it [Isa]
#   Currently the data sent to this function should contain:
#   - a character, with at least the keys 'fullname' and 'backstory'
#   - a premise, with at least the keys 'setting', 'goal', 'conflict' and 'resolution' 
#   - a story, with at least the key 'parts', where each part have the key 'text'
@app.route("/api/story", methods=["POST"])
def get_story_from_context():
    """
    Generate a story part from the given context.
    Context can have the drawing, a premise, the story so far, etc.
    Should generate a story part and return it.
    """

    data = request.get_json()
    
    character = {
        "name": data["character"]["fullname"],
        "about": data["character"]["backstory"],
    }

    premise = {
        "setting": data["premise"]["setting"],
        "goal": data["premise"]["goal"],
        "conflict": data["premise"]["conflict"],
        "resolution": data["premise"]["resolution"],
    }

    story = {
        "parts": [part["text"] for part in data["story"]["parts"]],
    }

    context = {
        "character": character,
        "premise": premise,
        "story": story,
    }

    try:
        llm = LLMStoryteller()
        story_part = llm.generate_story_part(context)
        if not story_part:
            return (
                jsonify({"error": f"Failed to generate story part."}),
                500,
            )
        return jsonify(story_part), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Load configurations from config.yml
    with open("config.yml", "r") as f:
        config = yaml.safe_load(f)

    # Verify that the config file is valid
    assert config["app"]["debug"], "debug key not found in config.yml"
    assert type(config["app"]["debug"]) == bool, "debug key must be a boolean"

    tempfile.tempdir = config["app"]["temp_folder"]

    # Start the Flask server
    app.run(debug=config["app"]["debug"])

app = Flask(__name__)
