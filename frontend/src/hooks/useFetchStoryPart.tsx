import { useState, useEffect } from "react";
import useAsync from "./useAsync";
import { TCharacter } from "../types/Drawing";
import { TStory, TStoryPart } from "../types/Story";
import { TPremise } from "../types/Premise";
import { addCurrentStoryPart } from "../store/sessionStore";

export interface IStoryContext {
  story?: TStory;
  character?: TCharacter;
  premise?: TPremise;
}

const useFetchStory = () => {
  const [context, setContext] = useState<IStoryContext>();

  const {
    error,
    loading,
    value: storyPart,
  } = useAsync(async () => {
    const response = await fetch("/api/story", {
      method: "POST",
      body: JSON.stringify(context),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get story");
    }

    const data = (await response.json()) as TStoryPart;
    addCurrentStoryPart(data);
    return data;
  }, [context]);
  const fetchStoryPart = (context: IStoryContext) => {
    setContext(context);
  };

  return { error, loading, storyPart, fetchStoryPart };
};

export default useFetchStory;
