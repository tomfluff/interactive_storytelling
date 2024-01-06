import "./DrawingScan.css";
import * as React from "react";
import useWebcam from "../../hooks/useWebcam";
import { Box, Button, CircularProgress, Paper, Stack } from "@mui/material";
import Webcam from "react-webcam";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import useFetchCharacter from "../../hooks/useFetchCharacter";

interface IDrawingScanProps {}

const DrawingScan: React.FC<IDrawingScanProps> = (props) => {
  const { webcamRef, base64Capture, capture, clear } = useWebcam();
  const { isLoading, error, data, fetchCharacter } = useFetchCharacter();

  const handleSendDrawing = () => {
    if (!base64Capture) return;
    fetchCharacter(base64Capture);
    clear();
  };

  if (isLoading)
    return (
      <Box className="drawing-scan-loader">
        <CircularProgress />
      </Box>
    );

  return (
    <Box className="drawing-scan-container">
      <Box className="drawing-scan-webcam">
        {base64Capture && <img src={base64Capture} alt="drawing preview" />}
        <Webcam ref={webcamRef} />
      </Box>
      <Stack
        className="drawing-scan-controls"
        direction="row-reverse"
        spacing={2}
      >
        {base64Capture && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<ReplayOutlinedIcon />}
            onClick={clear}
          >
            Retake
          </Button>
        )}
        {!base64Capture && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<CameraAltOutlinedIcon />}
            onClick={capture}
          >
            Capture
          </Button>
        )}
        {base64Capture && (
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={handleSendDrawing}
          >
            Start
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default DrawingScan;
