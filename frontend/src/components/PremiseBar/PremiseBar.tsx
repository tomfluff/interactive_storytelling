import "./PremiseBar.css";
import { useEffect, useState } from "react";
import { TPremise } from "../../types/Premise";
import {
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useSessionStore, addStory } from "../../store/sessionStore";
import { useDrawingStore } from "../../store/drawingStore";
import useAsync from "../../hooks/useAsync";
import useAudioStream from "../../hooks/useAudioStream";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface IPremiseBarProps {
  items: TPremise[];
  actionOnStart?: () => void;
}

const PremiseBar: React.FC<IPremiseBarProps> = ({ items, actionOnStart }) => {
  const [isStart, setIsStart] = useState<boolean>(false);
  const [premise, setPremise] = useState<TPremise | null>(null);
  const { audioRef, playAudioStream, stopAudioStream } = useAudioStream();

  const { loading, error, value } = useAsync(async () => {
    if (!premise) return;
    if (!isStart) return;

    const response = await fetch("/api/story");
    if (!response.ok) throw new Error("Failed to get story");
    const data = await response.json();
    const story = {
      drawing: useDrawingStore.getState().drawing,
      premise: premise,
      ...data,
    };
    addStory(story);
    return story;
  }, [premise, isStart]);

  const handlePremiseClick = (premise: TPremise) => {
    if (!premise) return;
    playAudioStream(premise.setting.long);
    setPremise(premise);
  };

  const handleOnStart = () => {
    setIsStart(true);
    if (actionOnStart) actionOnStart();
  };

  return (
    <Box className="premise-bar">
      <audio ref={audioRef} />
      <Stack direction="row" spacing={5} className="premise-selection">
        <ToggleButtonGroup
          color="secondary"
          value={premise}
          exclusive
          onChange={(event, value) => handlePremiseClick(value)}
        >
          {items.map((item, index) => {
            return (
              <ToggleButton key={index} value={item}>
                {item.setting.short}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
        <Button
          variant="contained"
          color="success"
          disabled={!premise}
          startIcon={<PlayArrowIcon />}
          onClick={handleOnStart}
        >
          Let's go!
        </Button>
      </Stack>
    </Box>
  );
};

export default PremiseBar;
