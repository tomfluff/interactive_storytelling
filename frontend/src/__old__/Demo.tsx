import logo from "./logo.svg";
import "./App.css";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import useWebcam from "../hooks/useWebcam";
import useFetchCharacter from "../hooks/useFetchCharacter";
import Webcam from "react-webcam";
import { useEffect, useState } from "react";
import { useDrawingStore } from "../store/drawingStore";
import useFetchPremise from "../hooks/useFetchPremise";
import PremiseBar from "../components/PremiseBar/PremiseBar";
import useAudioStream from "../hooks/useAudioStream";
import SpeechMonitor from "../components/SpeechMonitor/SpeechMonitor";
import DrawingScan from "../components/DrawingScan/DrawingScan";

function Demo() {
  const [sendDrawing, setSendDrawing] = useState<boolean>(false);
  const drawingData = useDrawingStore.use.drawing();
  const {
    isLoading: drawingIsLoading,
    error: drawingError,
    fetchCharacter,
  } = useFetchCharacter();
  const {
    isLoading: premiseIsLoading,
    error: premiseError,
    data: premises,
    fetchPremise,
  } = useFetchPremise();
  const { audioRef, isPlaying, isStreaming, playAudioStream, stopAudioStream } =
    useAudioStream();

  useEffect(() => {
    if (drawingData) {
      fetchPremise(drawingData.character);
    }
  }, [drawingData]);

  useEffect(() => {
    console.log(premises);
  }, [premises]);

  const handlePlayText = () => {
    if (!drawingData) return;

    playAudioStream(drawingData.character.backstory);
  };

  return (
    <Box>
      <Container>
        <Typography variant="h1">MyStoryKnight</Typography>
        <Box sx={{ backgroundColor: "red" }}>
          <DrawingScan />
        </Box>
        <Box>
          <SpeechMonitor feedback />
          <Stack direction="row" spacing={2}>
            <Typography variant="h3">
              Drawing: {drawingIsLoading ? "Loading..." : "Done"}{" "}
            </Typography>
            <Typography variant="h3">
              Premise: {premiseIsLoading ? "Loading..." : "Done"}{" "}
            </Typography>
            <Button variant="contained" onClick={() => setSendDrawing(true)}>
              Send
            </Button>
          </Stack>
          <Box>
            <Typography variant="h3">Drawing Error: {drawingError}</Typography>
            <Typography variant="h3">Premise Error: {premiseError}</Typography>
            <Typography variant="h2">Drawing</Typography>
            <Typography variant="h3">
              Full Name: {drawingData?.character.fullname}
            </Typography>
            <Typography variant="h3">
              Short Name: {drawingData?.character.shortname}
            </Typography>
            <Typography variant="h3">
              Items: {drawingData?.items.join(", ")}
            </Typography>
            <Typography variant="h3">
              Backstory: {drawingData?.character.backstory}
            </Typography>
          </Box>
          <PremiseBar items={premises ?? []} />
        </Box>

        <Box>
          <Button variant="contained" onClick={handlePlayText}>
            Read
          </Button>
          <Button variant="contained" onClick={() => stopAudioStream()}>
            Stop
          </Button>
          <Typography variant="h3">
            Status: {isPlaying ? "Playing" : "Stopped"}
          </Typography>
          <Typography variant="h3">
            Streaming: {isStreaming ? "Streaming" : "Not streaming"}
          </Typography>
        </Box>
        <audio ref={audioRef} />
      </Container>
    </Box>
  );
}

export default Demo;
