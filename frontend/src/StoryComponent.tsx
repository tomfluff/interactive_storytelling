import React from "react";
import { useState } from "react";

interface StoryState {
  loading: boolean;
  error: string | null;
}

const StoryComponent = () => {
  const [story, setStory] = useState<{message: string}>({message: ''});
  const [state, setState] = useState<StoryState>({
    loading: false,
    error: null,
  });

  const fetchStory = async () => {
    setState({ loading: true, error: null });
    fetch('http://127.0.0.1:5000/api/story')
    .then(response => response.json())
    .then(data => {
      setState({ loading: false, error: null }); 
      setStory(data) })
    .catch(error => {
      console.error(error);
      setState({ loading: false, error: (error as Error).message })
    });
  };

  const text = () => {
    if (state.loading) {
      return <div>Loading...</div>;
    }
    else if (state.error) {
      return <div>{state.error}</div>;
    }
    else {
      return <div>{story.message}</div>;
    }
  }

  return (
    <div>
      <button onClick={fetchStory}>Story</button>
      <p>
        {text()}
      </p>
    </div>
  );
}

export default StoryComponent;