# Interactive Storytelling
*(This is a project for the Multimedia Interfaces class at the University of Tokyo.)*

## About
`MyStoryKnight` is a web application that allows users to create and experience interactive stories. The application is built using the [Flask](https://flask.palletsprojects.com/en/1.1.x/) framework for Python. As well as the [React](https://reactjs.org/) JavaScript library with [TypeScript](https://www.typescriptlang.org/).

## Introduction
Storytelling is a long lived tradition [9]. Many parents still read stories to their children [12]. Stories are a key part of child development [13], creativity, and sense of agency [11]. These days, limited availability creates a situation where many parents are not able to tell stories to their children [12]. Especially stories that incorporate input from the children themselves, and promote creativity [1,2,4]. 

Prior work considered interaction with an existing character [10], enhanced collaborative storytelling between friends [8], image-based storytelling with non-verbal prompt generation [4], controlling characters through physical gestures [2] and even physical body engagement [3]. While these approaches consider creativity promotion in the textual domain, we are interested in other modalities for control and creativity, such as drawings. Even though sketch-based story control has been explored before [11], character generation was not considered. Moreover, while the advantages of LLM hallucinations have been mentioned [8, 13], our method utilizes these while maintaining user agency and authorship.

We propose MyStoryKnight, a creativity driven personalized storytelling by and for children using the power of generative AI. Using multi-modal input from the user, in the form of drawings and textual information, the story unfolds as an adventure that the user experiences alongside the avatar it created. Making choices about actions, events and so on for a personalized experience.

Our contributions are as follows:
1. Multi-modal input in the form of verbal information and drawings.
1. LLM hallucinations to generate an adventure-type story with user navigation.
1. Save-state to try different choices and create story branches. (maybe)

---

# References

- [1] CreativeBot: a Creative Storyteller Agent Developed by Leveraging Pre-trained Language Models (2022)
- [2] Applying tangible story avatars to enhance children’s collaborative storytelling (2012)
- [3] Narratron: Collaborative Writing and Shadow-playing of Children Stories with Large Language Models (2023)
- [4] Design implications of generative AI systems for visual storytelling for young learners (2023)
- [5] Designing Stories to Inspire Preschoolers’ Creative, Collaborative Roleplay (2023)
- [6] Design Ideation with AI -Sketching, Thinking and Talking with Generative Machine Learning Models (2023)
- [7] Collaborative Storytelling between Robot and Child: A Feasibility Study (2017)
- [8] SAGA: Collaborative Storytelling with GPT-3 (2021)
- [9] StoryMat: A Play Space for Collaborative Storytelling (1999)
- [10] Reality Tales: Facilitating User-Character Interaction with Immersive Storytelling (2021)
- [11] Sketch-Based Interaction for Planning-Based Interactive Storytelling (2020)
- [12] StoryBuddy: A Human-AI Collaborative Chatbot for Parent-Child Interactive Storytelling with Flexible Parental Involvement (2022)
- [13] AI Stories: An Interactive Narrative System for Children (2020)
- [14] Interactive Data Comics (2022)

---

## Implementation

### Configuration (setup)
Copy the `config.yml.example` file and add your own details.
1. `cd backend`
2. `cp config.yml.example config.yml`
3. Replace with your details (API key, etc.).


### Backend
Using [Flask](https://flask.palletsprojects.com/en/1.1.x/).

    backend/
    │   └── logs/
    ├── config.yml
    ├── llm.py
    └── app.py

- `config.yml` contains the configuration for the application.
- `llm.py` contains the code for the LLM.
- `app.py` contains the code for the Flask application.

#### Using LLM
- `send_llm_request()` sends a request to the LLM and returns the response, needs `request` item with the messages. (see example in `hello_world()` function in `llm.py`)
- `send_vision_request()` sends a request to the Vision LLM and returns the response, needs `request` item with the content. (see example in `understand_drawing()` function in `llm.py`)

#### LLM Examples

##### Drawing analysis
Based on [this image](https://www.123playandlearn.com/uploads/4/3/8/5/4385398/5966588_orig.jpg), the generated analysis is as follows:
```json
{
    "description": "A drawing of a child dressed as a superhero with text above.",
    "items": [
        "child",
        "superhero costume",
        "text",
        "logo"
    ],
    "colors": [
        {
            "color": "purple",
            "usage": "hair and cape of the superhero"
        },
        {
            "color": "red",
            "usage": "superhero bodysuit"
        },
        {
            "color": "yellow",
            "usage": "superhero gloves and belt"
        },
        {
            "color": "green",
            "usage": "superhero boots and pants"
        }
    ],
    "relationships": {
        "child": "wearing a superhero costume",
        "text": "above the child"
    },
    "story": "In a colorful town where every day is an adventure, there lived a joyful young hero known as Super Happy Kid. With a smile as bright as the sun and a heart full of courage, Super Happy Kid spent each day using his imagination to turn ordinary moments into extraordinary ones. Whether playing in the park or helping friends, Super Happy Kid always brought laughter and happiness to everyone around."
}
```

## Notes

