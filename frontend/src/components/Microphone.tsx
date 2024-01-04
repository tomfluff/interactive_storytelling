import React, { useEffect, useState } from "react";
import useMicrophone from "../hooks/useMicrophone";

const Microphone: React.FC = () => {
  const { status, audioUrl, start, stop } = useMicrophone();
  const [text, setText] = useState<string>("");

  return (
    <div>
      <button onClick={start}>Start Recording</button>
      <button onClick={stop}>Stop Recording</button>
      <p>{status}</p>
      <div>
        {audioUrl && (
          <>
            <audio controls autoPlay src={audioUrl} />
            <p>{audioUrl}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Microphone;
