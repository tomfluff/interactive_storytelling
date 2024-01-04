import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { createSelectors } from "../utils/createSelectors";
import { TSession } from "../types/Session";
import { TChoice, TStory, TStoryPart } from "../types/Story";

const initialSessionState: TSession = {
  id: "",
  init_time: Date.now(),
  last_update: Date.now(),
  curr_story: -1,
  stories: [],
};

export const useSessionStore = createSelectors(
  create<TSession>()(
    devtools((set, get) => initialSessionState, {
      name: "session",
    })
  )
);

export const setSession = (session: TSession) => {
  useSessionStore.setState(session);
};

export const addNewStory = (story: TStory) => {
  useSessionStore.setState((state) => ({
    ...state,
    stories: [...state.stories, story],
  }));
};

export const updateStory = (story: TStory) => {
  useSessionStore.setState((state) => ({
    ...state,
    stories: state.stories.map((s) => (s.id === story.id ? story : s)),
  }));
};

export const addCurrentStoryPart = (part: TStoryPart) => {
  useSessionStore.setState((state) => {
    const story = state.stories[state.curr_story];
    story.parts.push(part);
    return {
      ...state,
      stories: state.stories.map((s) => (s.id === story.id ? story : s)),
    };
  });
};

export const getCurrentActions = (): TChoice[] => {
  const currentId = useSessionStore.getState().curr_story;
  const story = useSessionStore.getState().stories[currentId];
  const part = story.parts[story.parts.length - 1];

  // TODO: Check if a copy of data is needed
  return part.choices;
};
