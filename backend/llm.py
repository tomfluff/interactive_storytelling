import json
import logging
import time
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
            self.model = config["openai"]["model"]  # gpt-4
            self.fmodel = config["openai"]["fmodel"]  # gpt-3.5
            self.vmodel = config["openai"]["vmodel"]  # gpt-4 vision
            self.vgen = config["openai"]["vgen"]  # dalle-2
            self.stt = config["openai"]["stt"]  # whisper
            self.tts = config["openai"]["tts"]  # tts-hd

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

    def generate_story_parts(self, context):
        # Send LLM request to generate a story part from the given context.
        character = context["character"]
        premise = context["premise"]
        story = context["story"]
        messages = [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": """
                        You are a helpful assistant and a great storyteller for children. Help me generate the next story part from this context.
                        0. Understand the input character, example:
                            {
                                "name": "Johnny the cat",
                                "about": "A cat who loves tuna."
                            }
                        1. Understand the input premise, example:
                            {
                                "setting": "Inside a house on a sunny day.",
                                "goal": "To find the stolen tuna.",
                                "conflict": "Someone has taken the character's tuna.",
                                "resolution": "The character solves the mystery and finds the tuna."
                            }
                        2. Understand the input story, example:
                            [
                                "Once upon a time there was a cat named Johnny who loved to eat tuna.",
                            ]
                        3. Generate two different options for how the story continues, using simple and easily understandable language.
                        4. Return the information as a JSON object.
                        5. Remove all styling from the JSON object and make sure it is readable and in plain text.
                        
                        Here is an example JSON object:
                        {
                            "list": [
                                {
                                    "text": "One day when Johnny was playing with his toys, he heard a noise coming from the kitchen. He went to investigate and found that someone had stolen his tuna!"
                                },
                                {
                                    "text": "One sunny day, Johnny the cat went to his usual spot in the house to find his favorite treat, tuna. But to his surprise, the tuna was missing! He knew he had to find out who took his delicious snack.
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
                        "text": str(premise),
                        "text": str(story),
                    },
                ],
            },
        ]
        data = self.send_fast_request(messages)
        return self.__get_json_data(data)

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
        try:
            if datastr.strip().startswith("```json"):
                return json.loads(datastr.split("```json")[1].split("```")[0])
            elif datastr.strip().startswith("{"):
                return json.loads(datastr)
            else:
                raise Exception("Could not parse JSON data from string")
        except Exception as e:
            logger.error(e)
        finally:
            logger.info(f"Data string: '{datastr}'")

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
                        2. Each premise should have the beginning of a sory that completes the following sentence: "Once upon a time...".
                        3. For each premise include the following:
                            - A setting.
                            - A goal.
                            - A conflict.
                            - A resolution.
                            - A story
                        4. Return the list as a JSON object with no styling and all in ascii characters.
                        
                        Example JSON object:
                        {
                            "list": [
                                {
                                    "setting": {"long":"A kingdom in the sky.","short": "Sky kingdom"},
                                    "goal": "To become a knight.",
                                    "conflict": "The character is not a noble.",
                                    "resolution": "The character becomes a knight by saving the princess.",
                                    "story": "Once upon a time, high above the clouds in the Sky Kingdom, there was a kind person who wanted to become a knight.",
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
        data = self.send_fast_request(messages)
        return self.__get_json_data(data)

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
                        6. Remove all styling from the JSON object and make sure it is readable and in plain text.
                        
                        Here is an example JSON object:
                        {
                            'items': ['cat', 'food bowl', 'sun', 'window'],
                            'description': 'A drawing of a cat looking at a food bowl.', 
                            'colors': [{'color':'black','usage':'the cat is black'}], 
                            'character': {
                                'fullname': 'Johnny the cat',
                                'shortname': 'Johnny',
                                'likes': ['tuna', 'playing with toys'],
                                'dislikes': ['dogs', 'water'],
                                'fears': ['dogs', 'water'],
                                'personality': ['friendly', 'hungry'],
                                'backstory': 'Johnny the cat loves tuna. He is always hungry and looking for food. He is a very friendly cat and loves to play with his toys.',
                            }
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
        data = self.send_vision_request(messages)
        return self.__get_json_data(data)

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
                "max_tokens": 1024,
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

            return jresponse["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(e)
            raise e

    def send_chat_request(self, request):
        try:
            response = self.llm().chat.completions.create(
                model=self.model,
                messages=request,
                response_format={"type": "json_object"},
                max_tokens=1024,
            )
            logger.debug(f"Successfuly sent 'chat' LLM request with model={self.model}")

            jresponse = json.loads(response.model_dump_json())
            with open("chat.json", "w") as f:
                json.dump(jresponse, f, indent=4)

            return jresponse["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(e)
            raise e

    def send_fast_request(self, request):
        try:
            response = self.llm().chat.completions.create(
                model=self.fmodel,
                messages=request,
                max_tokens=1024,
            )
            logger.debug(
                f"Successfuly sent 'fact chat' LLM request with model={self.fmodel}"
            )

            jresponse = json.loads(response.model_dump_json())
            with open("fchat.json", "w") as f:
                json.dump(jresponse, f, indent=4)

            return jresponse["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(e)
            raise e

    def send_image_request(self, request):
        try:
            response = self.llm().images.create(
                model=self.vgen,
                prompt=request,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            logger.debug(f"Successfuly sent 'image' LLM request with model={self.vgen}")

            image_url = response.data[0].url
            return image_url
        except Exception as e:
            logger.error(e)
            raise e

    def send_speech_request(self, text):
        # Based on this answer: https://github.com/openai/openai-python/issues/864#issuecomment-1872681672
        url = "https://api.openai.com/v1/audio/speech"
        headers = {
            "Authorization": f"Bearer {config['openai']['key']}",
            "OpenAI-Organization": f"{config['openai']['org']}",
        }
        data = {
            "model": self.tts,
            "input": text,
            "voice": "echo",
            "response_format": "mp3",
        }

        with requests.post(url, headers=headers, json=data, stream=True) as response:
            if response.status_code == 200:
                logger.debug(
                    f"Successfuly sent 'speech' LLM request with model={self.tts}"
                )
                for chunk in response.iter_content(chunk_size=8192):
                    yield chunk

    def send_voice_request(self, input):
        pass
