import React from "react";
import Webcam from "react-webcam";

import { useCallback, useRef, useState } from "react";

const CustomWebcam = () => {
  const webcamRef = useRef<Webcam>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [img, setImg] = useState<string | null>(null);

  // Capture photo from webcam
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImg(imageSrc);
    }
  }, [webcamRef]);

  // Retake photo
  const retake = () => {
      setImg(null);
  };

  // TODO: Not sure if this is the best way to do this
  // Send request to backend to upload image
  const upload = () => {
    fetch('http://127.0.0.1:5000/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
        },
      body: JSON.stringify(img)
    })
      .then(response => response.json())
      .then(result => {console.log(result);})
      .catch(error => console.error(error));
    setVisible(false);
    setImg(null);
  };


  const showWebcam = () => {
    setVisible(true);
  };

  if (!visible) {
    return (
      <div className="container">
        <button onClick={showWebcam}>Show Webcamera</button>
      </div>
    );
  }

  return (
    <div className="container">
      {img ? (
        <img src={img} alt="webcam" />
      ) : (
        <Webcam
          height={600}
          width={600}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.8}
          mirrored={false}
        />
      )}
      <div className="btn-container">
        {img ? (
          <p>
            <button onClick={retake}>Retake photo</button>
            <button onClick={upload}>Upload photo</button>
          </p>
        ) : (
          <button onClick={capture}>Take photo</button>
        )}
      </div>
    </div>
  );
};

export default CustomWebcam;