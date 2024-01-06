import "./StartPage.css";
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import DrawingScan from "../../components/DrawingScan/DrawingScan";
import useFetchSession from "../../hooks/useFetchSession";
import { useDrawingStore } from "../../store/drawingStore";
import CharacterCard from "../../components/CharacterCard/CharacterCard";
import PremiseBar from "../../components/PremiseBar/PremiseBar";
import useFetchPremise from "../../hooks/useFetchPremise";
import { useEffect, useState } from "react";
import { TPremise } from "../../types/Premise";

interface IStartPageProps {}

const StartPage: React.FC<IStartPageProps> = (props) => {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [premiseChoice, setPremiseChoice] = useState<TPremise | null>(null);

  const currentDrawing = useDrawingStore.use.drawing();
  const { fetchSession, value } = useFetchSession();
  const {
    data,
    error,
    fetchPremise,
    isLoading: premiseLoading,
  } = useFetchPremise();

  useEffect(() => {
    if (!currentDrawing) return;
    if (data) return;

    fetchPremise(currentDrawing.character);
  }, [currentDrawing, fetchPremise, data]);

  const handleSessionStart = () => {
    setIsStarted(true);
    fetchSession();
  };

  const handleStoryStart = () => {
    console.log("Story start");
  };

  return (
    <Box className="start-page">
      <Box className="start-page__title">
        <Typography variant="h1">MyStoryKnight.</Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleSessionStart}
      >
        Start your adventure
      </Button>
      <Modal open={isStarted} keepMounted disableAutoFocus disableEnforceFocus>
        <Paper
          elevation={3}
          sx={{
            height: "auto",
            width: "auto",
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            borderRadius: "1em",
            transform: "translate(-50%, -50%)",
          }}
        >
          {!currentDrawing && (
            <Box p={2}>
              <DrawingScan />
            </Box>
          )}
          {currentDrawing && (
            <Box p={2}>
              <Stack direction="column" spacing={2}>
                <CharacterCard
                  url={currentDrawing.url}
                  character={currentDrawing.character}
                  colors={currentDrawing.colors}
                />
                {data && (
                  <PremiseBar items={data} actionOnStart={handleStoryStart} />
                )}
                {!data && premiseLoading && (
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </Paper>
      </Modal>
    </Box>
  );
};

export default StartPage;
