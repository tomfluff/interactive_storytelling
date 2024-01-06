import "./StartPage.css";
import { Box, Button, Modal, Paper, Typography } from "@mui/material";
import * as React from "react";
import DrawingScan from "../../components/DrawingScan/DrawingScan";
import useFetchSession from "../../hooks/useFetchSession";
import { useDrawingStore } from "../../store/drawingStore";

interface IStartPageProps {}

const StartPage: React.FC<IStartPageProps> = (props) => {
  const [isStarted, setIsStarted] = React.useState<boolean>(false);
  const { fetchSession, value } = useFetchSession();
  const currentDrawing = useDrawingStore.use.drawing();

  const handleSessionStart = () => {
    setIsStarted(true);
    fetchSession();
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
            padding: "2rem",
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <DrawingScan />
        </Paper>
      </Modal>
    </Box>
  );
};

export default StartPage;
