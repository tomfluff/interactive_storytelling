import json
import logging
import yaml
import os

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
        return self.send_llm_request(messages)

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

    def understand_drawing(self, drawing, json_content=True):
        try:
            messages = [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": "You are a helpful assistant. Help me understand these drawings.",
                        },
                        {
                            "type": "text",
                            "text": "For each drawing I send you, describe the content of the drawing.",
                        },
                        {
                            "type": "text",
                            "text": "Tell me what items are drawn, what colors are used, relationships are between items, and a make up a short backstory fit for children about the content of the drawing.",
                        },
                        {
                            "type": "text",
                            "text": "Return the information as a simplified JSON file with the following keys: 'description', 'items', 'colors', 'relationships', 'story'.",
                        },
                        {
                            "type": "text",
                            "text": "Remove all styling and line-beaks from the response and return plain text only.",
                        },
                        {
                            "type": "text",
                            "text": "Do not use apostrophes in the response content.",
                        },
                        {
                            "type": "text",
                            "text": "Here is such JSON file: {'description': 'A drawing of a cat and a dog.', 'items': ['cat', 'dog', 'food bowl', 'sun', 'window'], 'colors': [{'color':'black','usage':'the cat is black'}], 'relationships': {'cat': 'standing next to the food bowl'},'story': 'The cat and dog are fighting over the food in the bowl.'}",
                        },
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Can you explain this drawing?"},
                        {
                            "type": "image_url",
                            "image_url": {"url": drawing},
                        },
                    ],
                },
            ]
            response = self.send_vision_request(messages)
            if json_content:
                return json.loads(response.strip().replace("'", '"'))
            else:
                return response
        except Exception as e:
            logger.error(e)
            raise e

    def send_vision_request(self, request):
        try:
            response = self.llm().chat.completions.create(
                model=self.vmodel,
                messages=request,
                max_tokens=512,
            )
            logger.debug(
                f"Successfuly sent 'vision' LLM request with model={self.vmodel}"
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(e)
            raise e

    def send_llm_request(self, request):
        try:
            response = self.llm().chat.completions.create(
                model=self.model,
                messages=request,
                max_tokens=256,
            )
            logger.debug(f"Successfuly sent 'chat' LLM request with model={self.model}")
            return response.choices[0].message.content
        except Exception as e:
            logger.error(e)
            raise e
