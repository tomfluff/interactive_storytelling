import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

const useWebcam = () => {
  const webcamRef = useRef<Webcam>(null);
  const [base64Capture, setBase64Capture] = useState<string | null>(null);

  // Capture photo from webcam
  const captureWebcam = useCallback(() => {
    if (webcamRef.current) {
      const captured = webcamRef.current.getScreenshot();
      setBase64Capture(captured);
    }
  }, [webcamRef]);

  return { webcamRef, base64Capture, captureWebcam };
};

export default useWebcam;
