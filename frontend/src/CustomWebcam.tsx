import React from "react";
import Webcam from "react-webcam";

import { useCallback, useRef, useState } from "react";

const CustomWebcam = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // Capture photo from webcam
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  // Retake photo
    const retake = () => {
      setImgSrc(null);
  };

  // TODO: Dosen't work yet
  // Send request to backend to upload image
  const upload = () => {
    const data = new FormData();
    if (imgSrc != null) {
      data.append('img', imgSrc);
    }
    fetch('http://127.0.0.1:5000/api/upload', {
      method: 'POST',
      body: data,
    })
      .then(response => response.json())
      .then(result => {console.log(result);})
      .catch(error => console.error(error));
  };

  return (
    <div className="container">
      {imgSrc ? (
        <img src={imgSrc} alt="webcam" />
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
        {imgSrc ? (
          <p>
            <button onClick={retake}>Retake photo</button>
            <button onClick={upload}>Upload photo</button>
          </p>
        ) : (
          <button onClick={capture}>Capture photo</button>
        )}
      </div>
    </div>
  );
};

export default CustomWebcam;