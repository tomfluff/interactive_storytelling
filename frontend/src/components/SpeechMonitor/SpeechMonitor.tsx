import "./SpeechMonitor.css";
import React, { useEffect, useState } from "react";
import useMicrophone from "../../hooks/useMicrophone";
import { Box, Stack, ToggleButton } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicNoneIcon from "@mui/icons-material/MicNone";

interface ISpeechMonitor {
  controls?: boolean;
  feedback?: boolean;
  readyHandler?: () => Promise<void> | void;
}

const SpeechMonitor: React.FC<ISpeechMonitor> = ({
  controls,
  feedback,
  readyHandler,
}) => {
  const audioRef = React.useRef<HTMLAudioElement>(new Audio());
  const { status, isClipping, audioChunks, start, stop, halt, resume } =
    useMicrophone();
  const [isActive, setIsActive] = useState<boolean>(false);

  const toggleActive = () => {
    setIsActive((prev) => {
      if (prev) stop();
      else start();
      return !prev;
    });
  };

  useEffect(() => {
    if (audioChunks.length > 0) {
      const blob = new Blob(audioChunks, { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.oncanplay = async () => {
        if (readyHandler) readyHandler();
      };
    }
  }, [audioChunks, feedback, readyHandler]);

  return (
    <Stack className="microphone-container" direction="row" spacing={2}>
      <ToggleButton
        value={isActive}
        selected={isActive}
        onChange={toggleActive}
        color="error"
        sx={{ borderRadius: "50%", borderWidth: "2px", borderColor: "inherit" }}
      >
        {isActive ? <MicIcon /> : <MicNoneIcon />}
      </ToggleButton>
      <audio
        ref={audioRef}
        controls={controls}
        autoPlay={feedback}
        onPlay={() => halt()}
        onPause={() => resume()}
        onEnded={() => resume()}
      />
    </Stack>
  );
};

export default SpeechMonitor;
