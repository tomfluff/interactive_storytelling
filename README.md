# Interactive Storytelling
*(This is a project for the Multimedia Interfaces class at the University of Tokyo.)*

## Tasks
- [x] Create a basic Flask application (BE).
- [ ] Create a basic React application for backend testing (FE).
- [ ] Immpleent integration with camera (FE).
- [ ] Implement image upload mechanism locally (BE).
- [ ] Complete interactions with LLM (BE).

## Roadmap
> Think simple, start small, and iterate.

### Phase 1 (23/12/28-24/1/3)
1. Create a basic Flask application. `(Yotam)` [DONE]
2. Generate a random session ID (GUID). `(Yotam)` [DONE]
3. Generate a JSON file with the session ID and the story so far. `(Yotam)` [DONE]
4. POST request to for an image (simple react component upload image to `/api`). `(Isa)`
5. React to connect to webcam and take a picture. `(Isa)`
6. Display the analysis to the user and the user image. `(Isa)`
   1. [Open AI Docuentation](https://platform.openai.com/docs/guides/vision)
7. Ask the llm `where would this character go next?`. `(Yotam)`
8. Based on button press we generate the next part of the story. `(Yotam+Isa)`
   1. Feed the story so far.
   2. Feed special instructions.
9.  Generate the next possible actions. `(Yotam)`
10. Rpeating with user choices, GET with session ID and choise ID. `(Isa)`
11. End the story with special llm instruction. `(Yotam+Isa)`

### Phase 2 (24/1/4-24/1/10)
1. Incorporate TTS and STT.
2. Do image gneration for story parts.
3. Track story elememnts (nouns).
4. Use the tracked elements to generate the next part of the story.
5. Limit the complexity of the story.

### Phase 3 (24/1/11-24/1/17)
1. Refinements.
2. Bug fixes.
3. (maybe) Upload to Google Cloud Platform.

### Phase 4 (24/1/18-24/1/24)
1. Final touches.
2. Create a simple video showcasing the project.
3. Create the presentation.

### Final Presentation (24/1/25)
1. Present the project.

## About
`MyStoryKnight` is a web application that allows users to create and experience interactive stories. The application is built using the [Flask](https://flask.palletsprojects.com/en/1.1.x/) framework for Python. As well as the [React](https://reactjs.org/) JavaScript library with [TypeScript](https://www.typescriptlang.org/).

## Introduction
Storytelling is a long lived tradition [9]. Many parents still read stories to their children [12]. Stories are a key part of child development [13], creativity, and sense of agency [11]. These days, limited availability creates a situation where many parents are not able to tell stories to their children [12]. Especially stories that incorporate input from the children themselves, and promote creativity [1,2,4]. 

Prior work considered interaction with an existing character [10], enhanced collaborative storytelling between friends [8], image-based storytelling with non-verbal prompt generation [4], controlling characters through physical gestures [2] and even physical body engagement [3]. While these approaches consider creativity promotion in the textual domain, we are interested in other modalities for control and creativity, such as drawings. Even though sketch-based story control has been explored before [11], character generation was not considered. Moreover, while the advantages of LLM hallucinations have been mentioned [8, 13], our method utilizes these while maintaining user agency and authorship.

We propose MyStoryKnight, a creativity driven personalized storytelling by and for children using the power of generative AI. Using multi-modal input from the user, in the form of drawings and textual information, the story unfolds as an adventure that the user experiences alongside the avatar it created. Making choices about actions, events and so on for a personalized experience.

Our contributions are as follows:
1. Input in the form of drawings (and maybe more).
2. LLM hallucinations to generate an adventure-type story with user navigation.
3. Save-state to try different choices and create story branches. (maybe)

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

### Microphone integration
Based on [WeBAD](https://github.com/solyarisoftware/WeBAD).

### Configuration (setup)
Copy the `config.yml.example` file and add your own details.
1. `cd backend`
2. `cp config.yml.example config.yml`
3. Replace with your details (API key, etc.).

### Data structures
General concept for data structures. This is not the final structure, but a general idea.
Current approach is to use a local JSON file as a database for simmplicity.
In actuality we impleemnt a **siplified version** of the DB structure with partial data.

NOTE: For ost updated structures please refer to `frontend/src/types` folder.

#### Session DB structure
Session is a data structure with an id and a list of story ids.
```json
{
    "id": "session_id",
    "init_time": "initialization time",
    "last_update": "last update time",
    "curr_story": "story_id",
    "stories": "list of stories",
}
```

### Drawing DB structure
Drawing is a data structure with an id and a list of story ids.
```json
{
    "id": "drawing_id",
    "url": "file url",
    "source": "url or file or camera",
    "description": "drawing_description",
    "items": ["item1", "item2", "item3"],
    "character": {
        "fullname": "full nae of the character",
        "shortname": "short name of the character",
        "likes": ["like1", "like2", "like3"],
        "dislikes": ["dislike1", "dislike2", "dislike3"],
        "fears": ["fear1", "fear2", "fear3"],
        "personality": ["personality1", "personality2", "personality3"],
        "backstory": "drawing_backstory",
    }
}
```

#### Premimse DB structure
Premise is a data structure with an id and information on a story premimse.
```json
{
    "id": "premise_id",
    "setting": "premise_setting",
    "goal": "premise_goal",
    "conflict": "premise_conflict",
    "resolution": "premise_resolution",
    "story": "first part of the story",
}
```

#### Story DB structure
Story is a data structure with an id and a list of story parts.
```json
{
    "id": "story_id",
    "drawing": "drawing",
    "init_time": "initialization time",
    "parts": [
        {
            "id": "story_part_id",
            "time": "story_part_time",
            "trigger": "story_part_trigger, the user choice",
            "text": "story_part_text",
            "image": "story_part_image",
            "choices": [
                {
                    "id": "choice_id",
                    "text": "choice_text",
                    "description": "choice_description",
                }
            ],
            "analytics": {
                "entities": [
                    {
                        "name": "entity_name",
                        "type": "entity_type",
                        "is_new": true/false,
                        "is_active": true/false,
                    }
                ],
                "intensity": "intensity value (0-1)",
                "emotion": "emotion, e.g. 'happy', 'sad', etc.",
                "positioning": "positioning, e.g. 'start', 'middle', 'end', etc.",
                "complexity": "complexity value (0-1)",
            },
        }
    ]
}
```

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

* [Drawing Character Animation](https://github.com/facebookresearch/AnimatedDrawings#amateur-drawings-dataset), a Meta algorithm to animation drawings.
