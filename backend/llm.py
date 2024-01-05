import json
import logging
import yaml
import os
import requests

from openai import OpenAI

# General setting up
with open("config.yml", "r") as stream:
    config = yaml.safe_load(stream)

# Create log file and all path folders if not exists
os.makedirs(os.path.dirname(config["llm"]["log_location"]), exist_ok=True)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG if config["app"]["debug"] else logging.INFO)
formatter = logging.Formatter(
    fmt="%(asctime)s [%(levelname)s]: %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
)
handler = logging.StreamHandler(stream=open(config["llm"]["log_location"], "w"))
handler.setFormatter(formatter)
logger.addHandler(handler)


class OpenAILLM:
    def __init__(self) -> None:
        self.client = OpenAI(
            api_key=config["openai"]["key"], organization=config["openai"]["org"]
        )
        logger.info("OpenAI LLM client initialized")

    def __call__(self):
        return self.client


class LLMStoryteller:
    def __init__(self) -> None:
        if config["llm"]["type"] == "openai":
            self.llm = OpenAILLM()
            self.model = config["openai"]["model"]
            self.vmodel = config["openai"]["vmodel"]
            self.vgen = config["openai"]["vgen"]
            self.stt = config["openai"]["stt"]
            self.tts = config["openai"]["tts"]
            self.upload_folder = config["app"]["upload_folder"]
            logger.info(f"LLM storyteller initialized with model={self.model}")
        else:
            logger.error(f"LLM type {config['llm']['type']} is not implemented")
            raise NotImplementedError(
                f"LLM type {config['llm']['type']} is not implemented"
            )

    def hello_world(self):
        messages = [
            {"role": "system", "content": "You are a helpful chatbot."},
            {"role": "user", "content": "Hello, who are you?"},
        ]
        return self.send_chat_request(messages)

    def generate_story_image(self, prompt):
        response = self.llm().images.generate(
            model=self.vgen,
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        return image_url

    def generate_story_part(self, prompt):
        # Send LLM request to generate a story based on the given prompt
        pass

    def generate_action_choices(self, story):
        # Choose an action based on the generated story
        pass

    def inquire_drawing(self, data):
        # Send LLM request to inquire about the drawing (based on the data)
        pass

    def analyze_feedback(self, feedback):
        # Analyze the user feedback (positive or negative, etc.)
        pass

    def calc_story_part_score(self, story_part):
        # Get the score of a story part
        pass

    def transcribe_audio(self, audio):
        audio_file = open(audio, "rb")
        transcript = self.llm().audio.transcriptions.create(
            model=self.stt,
            file=audio_file,
            response_format="verbose_json",
            language="en",
        )
        return transcript.model_dump_json(indent=4)

    def __get_json_data(self, datastr):
        if datastr.strip().startswith("```json"):
            return json.loads(datastr.split("```json")[1].split("```")[0])
        elif datastr.strip().startswith("{"):
            return json.loads(datastr)
        else:
            logger.error(f"Could not parse JSON data from string: '{datastr}'")
            return None

    def __get_least_frequenct_word(self, story_part):
        # Get the least frequent word in the story part
        pass

    def __get_diff_story_elements(self, story_part):
        # Get the different story elements in the story part
        pass

    def __get_named_story_elements(self, story_part):
        # Get the named story elements in the story part
        pass

    def __check_ending_condition(self):
        # Check if the story should be finished
        pass

    def generate_premise(self, character):
        # Generate a premise based on the given character
        messages = [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": """
You are a helpful assistant. Help me generate a story premise for this character.
0. Understand the input character, example: {"name": "Johnny the cat", "about": "A cat who loves tuna."}.
1. Generate two different story premises for this character.
2. Each premise should complete the following sentence: "Once upon a time...".
3. For each premise include the following:
    - A setting.
    - A goal.
    - A conflict.
    - A resolution.
4. Come up with the first paragraph of the story for each premise.
    - The language should be simple and easy to understand.
    - The paragraph should end with a cliffhanger.
5. Return the premises as a JSON object with no styling and all in ascii characters.

Example JSON object:
{
    "list": [
        {
            "setting": "A kingdom in the sky.",
            "goal": "To become a knight.",
            "conflict": "The character is not a noble.",
            "resolution": "The character becomes a knight by saving the princess.",
            "story": "Once upon a time there was a knight who lived in a kingdom in the sky. He wanted to become a knight, but he was not a noble. He spent his days dreaming of becoming a knight. One day, he heard a knock on his door..."
        },
    ]
}
""",
                    }
                ],
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": str(character),
                    },
                ],
            },
        ]
        return self.send_chat_request(messages)

    def understand_drawing(self, drawing_url):
        messages = [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": """
You are a helpful assistant. Help me understand the drawing in this photo.
1. Describe the content of the drawing.
2. Tell me what items are drawn.
3. Come up with a name for the character in the drawing.
4. Make up a short backstory about the character in the drawing, that inckudes the following:
    - Who is this character?
    - What are the dreams and goals of this character?
    - What are the fears and worries of this character?
    - What is the character's personality?
5. Return the information as a JSON object using double quotes for keys and values.
6. Reove all styling from the JSON object and make sure it is readable and in plain text.

Here is an example JSON object: 
{
'fullname': 'Johnny the cat',
'shortname': 'Johnny',
'description': 'A drawing of a cat looking at a food bowl.', 
'items': ['cat', 'food bowl', 'sun', 'window'],
'colors': [{'color':'black','usage':'the cat is black'}], 
'backstory': 'Johnny the cat loves tuna. He is always hungry and looking for food. He is a very friendly cat and loves to play with his toys.'
}
                        """,
                    }
                ],
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": drawing_url,
                    },
                ],
            },
        ]
        return self.send_vision_request(messages)

    def send_vision_request(self, request):
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {config['openai']['key']}",
                "OpenAI-Organization": f"{config['openai']['org']}",
            }
            payload = {
                "model": self.vmodel,
                "messages": request,
                "max_tokens": 512,
            }
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            logger.debug(
                f"Successfuly sent 'vision' LLM request with model={self.vmodel}"
            )

            jresponse = response.json()
            with open("vision.json", "w") as f:
                json.dump(jresponse, f, indent=4)

            return self.__get_json_data(jresponse["choices"][0]["message"]["content"])
        except Exception as e:
            logger.error(e)
            raise e

    def send_chat_request(self, request):
        try:
            response = self.llm().chat.completions.create(
                model=self.model,
                messages=request,
                response_format={"type": "json_object"},
                max_tokens=512,
            )
            logger.debug(f"Successfuly sent 'chat' LLM request with model={self.model}")

            jresponse = json.loads(response.model_dump_json(indent=4))
            with open("chat.json", "w") as f:
                json.dump(jresponse, f, indent=4)

            return self.__get_json_data(jresponse["choices"][0]["message"]["content"])
        except Exception as e:
            logger.error(e)
            raise e
