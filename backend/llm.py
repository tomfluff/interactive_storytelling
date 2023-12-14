from typing import Any
from openai import OpenAI

class OpenAILLM:
    def __init__(self, config) -> None:
        self.client = OpenAI(api_key=config['openai/key'],organization=config['openai/org'])

    def __call__(self):
        return self.client

class LLMStoryteller:
    def __init__(self, config) -> None:
        if config['llm/type'] == 'openai':
            self.llm = OpenAILLM(config)
            self.model = config['openai/model']
        else:
            raise NotImplementedError(f"LLM type {config['llm/type']} is not implemented")

    def hello_world(self):
        response = self.llm().chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a helpful chatbot."},
                {"role": "user", "content": "Hello, who are you?"},
            ]
        )
        return response.choices[0].text

    def generate_story(self, prompt):
        # Send LLM request to generate a story based on the given prompt
        pass

    def choose_action(self, story):
        # Choose an action based on the generated story
        pass

    def send_llm_request(self, request):
        # Send a generic LLM request
        pass
