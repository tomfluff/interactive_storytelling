import { Details } from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const defaultVoiceMeterConfig = {
  clipLevel: 0.98,
  averaging: 0.95,
  clipLag: 750,
};

const defaultVolumeConfig = {
  mute: 0.0001,
  silence: 0.0001,
  speaking: 0.02,
  min_avg_speaking: 0.04,
  detection_interval: 750,
  time_interval: 128,
};

const createAudioMeter = async (
  audioContext: AudioContext,
  config?: typeof defaultVoiceMeterConfig
): Promise<AudioWorkletNode | null> => {
  await audioContext.audioWorklet.addModule("worklet/voiceMeterProcessor.js");
  const meter = new AudioWorkletNode(audioContext, "voice-meter-processor", {
    parameterData: {
      ...defaultVoiceMeterConfig,
      ...config,
    },
  });
  return meter;
};

type TStatus = "stopped" | "listening" | "recording";
type TMode =
  | "mute"
  | "prespeech"
  | "speechatart"
  | "speaking"
  | "speechend"
  | "silence";

interface IVolumeMeterEventDetail {
  volume: number;
  timestamp: number;
}

interface IVoiceData {
  mode: TMode;
  isRecording: boolean;
  speechStart: number;
  speechEnd: number;
  speechItemsNum: number;
  silenceItemsNum: number;
  preSpeechItemsNum: number;
}

const useMicrophone = (
  props: typeof defaultVolumeConfig = defaultVolumeConfig
) => {
  const [status, setStatus] = useState<TStatus>("stopped");

  const voiceDataRef = useRef<IVoiceData>({
    mode: "mute",
    isRecording: false,
    speechStart: -1,
    speechEnd: -1,
    speechItemsNum: 0,
    silenceItemsNum: 0,
    preSpeechItemsNum: 0,
  });
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const meterRef = useRef<AudioWorkletNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handlePreSpeechProcessing = () => {
    ++voiceDataRef.current.preSpeechItemsNum;
    console.log(
      "handlePreSpeechProcessing, num: ",
      voiceDataRef.current.preSpeechItemsNum,
      "mode=",
      voiceDataRef.current.mode,
      "detect_interval=",
      defaultVolumeConfig.detection_interval,
      "time_interval=",
      defaultVolumeConfig.time_interval
    );
    if (
      (voiceDataRef.current.mode === "silence" ||
        voiceDataRef.current.mode === "mute") &&
      voiceDataRef.current.preSpeechItemsNum >=
        defaultVolumeConfig.detection_interval /
          defaultVolumeConfig.time_interval
    ) {
      console.log("useEffect -> recorderRestart");
      recorderRestart();
      voiceDataRef.current.preSpeechItemsNum = 0;
    }
  };

  const handleVolumeDetection = (volume: number) => {
    const detail: IVolumeMeterEventDetail = {
      volume: volume,
      timestamp: Date.now(),
    };
    if (volume < props.mute) {
      document.dispatchEvent(new CustomEvent("mute", { detail: detail }));
    } else if (volume > props.speaking) {
      document.dispatchEvent(new CustomEvent("speaking", { detail: detail }));
    } else {
      document.dispatchEvent(new CustomEvent("silence", { detail: detail }));
    }
  };

  const recorderRestart = () => {
    if (voiceDataRef.current.isRecording) return;

    console.log("recorderRestart");
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current.start();
      setStatus("recording");
      voiceDataRef.current.isRecording = true;
    }
  };

  const recorderPause = () => {
    if (!voiceDataRef.current.isRecording) return;

    console.log("recorderStop");
    if (recorderRef.current) {
      recorderRef.current.stop();
      setStatus("listening");
      voiceDataRef.current.isRecording = false;
    }
  };

  const recorderStop = () => {
    console.log("recorderStop");
    if (recorderRef.current) recorderRef.current.stop();
    recorderRef.current = null;
    voiceDataRef.current.isRecording = false;
  };

  const meterStop = () => {
    console.log("meterStop");
    if (meterRef.current) meterRef.current.disconnect();
    meterRef.current = null;
  };

  const sourceStop = () => {
    console.log("sourceStop");
    if (sourceRef.current) sourceRef.current.disconnect();
    sourceRef.current = null;
  };

  const onVolumeEvent = (e: CustomEvent) => {
    if (!voiceDataRef.current.mode) return;

    if (e.type === "mute") {
      voiceDataRef.current.mode = "mute";
    } else if (voiceDataRef.current.mode === "mute" && e.type === "silence") {
      voiceDataRef.current.mode = "silence";
    } else if (
      voiceDataRef.current.mode === "silence" &&
      e.type === "speaking"
    ) {
      voiceDataRef.current.speechStart = e.detail.timestamp;
      voiceDataRef.current.mode = "speechatart";
    } else if (
      voiceDataRef.current.mode === "speechatart" &&
      e.type === "speaking"
    ) {
      voiceDataRef.current.mode = "speaking";
      voiceDataRef.current.speechItemsNum = 0;
      voiceDataRef.current.speechItemsNum++;
    } else if (
      voiceDataRef.current.mode === "speechatart" &&
      e.type === "silence"
    ) {
      voiceDataRef.current.mode = "speechend";
    } else if (
      voiceDataRef.current.mode === "speaking" &&
      e.type === "speaking"
    ) {
      voiceDataRef.current.speechItemsNum++;
    } else if (
      voiceDataRef.current.mode === "speaking" &&
      e.type === "silence"
    ) {
      voiceDataRef.current.speechEnd = e.detail.timestamp;
      voiceDataRef.current.mode = "speechend";
    } else if (
      voiceDataRef.current.mode === "speechend" &&
      e.type === "speaking"
    ) {
      voiceDataRef.current.mode = "speechatart";
    } else if (
      voiceDataRef.current.mode === "speechend" &&
      e.type === "silence"
    ) {
      voiceDataRef.current.mode = "silence";
      voiceDataRef.current.silenceItemsNum++;
    } else if (
      voiceDataRef.current.mode === "silence" &&
      e.type === "silence"
    ) {
      voiceDataRef.current.silenceItemsNum++;
    } else {
      console.log(
        "Unknown state! mode: ",
        voiceDataRef.current.mode,
        "event: ",
        e.type
      );
    }
    // console.log("onVolumeEvent -> ", voiceDataRef.current);
  };

  useEffect(() => {
    document.addEventListener("mute", onVolumeEvent as EventListener);
    document.addEventListener("silence", onVolumeEvent as EventListener);
    document.addEventListener("speaking", onVolumeEvent as EventListener);
    const preSpeechTimer = setInterval(
      handlePreSpeechProcessing,
      props.time_interval
    );
    return () => {
      clearInterval(preSpeechTimer);
      document.removeEventListener("mute", onVolumeEvent as EventListener);
      document.removeEventListener("silence", onVolumeEvent as EventListener);
      document.removeEventListener("speaking", onVolumeEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    console.log(
      "useEffect -> voiceDataRef.current.speechItemsNum: ",
      voiceDataRef.current.speechItemsNum
    );
    if (
      voiceDataRef.current.mode !== "speaking" &&
      voiceDataRef.current.silenceItemsNum >=
        defaultVolumeConfig.detection_interval /
          defaultVolumeConfig.time_interval
    ) {
      console.log("useEffect -> recorderPause");
      recorderPause();
      voiceDataRef.current.silenceItemsNum = 0;
    }
  }, [voiceDataRef.current.silenceItemsNum]);

  const terminate = () => {
    sourceStop();
    meterStop();
    recorderStop();
    setAudioUrl(null);
    setAudioChunks([]);
  };

  const initialize = async () => {
    // Create an AudioContext object for the audio processing.
    if (!audioContextRef.current) audioContextRef.current = new AudioContext();
    audioContextRef.current.resume();

    // Then create a MediaStreamAudioSourceNode object for the audio input.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContextRef.current.createMediaStreamSource(stream);
    sourceRef.current = source;
    // Create a new volume meter and connect it.
    const meter = await createAudioMeter(audioContextRef.current);
    meterRef.current = meter;

    // Set up the recorder
    const recorder = new MediaRecorder(source.mediaStream, {
      mimeType: "audio/webm",
    });
    recorder.ondataavailable = (e) => {
      console.log("ondataavailable -> ", e.data);
      setAudioChunks(() => [e.data]);
    };
    recorderRef.current = recorder;

    if (meter) {
      source.connect(meter);
      meter.port.onmessage = (e) => {
        handleVolumeDetection(e.data.volume);
      };
    }
  };

  const stop = () => {
    if (status === "stopped") return;
    terminate();
    setStatus("stopped");
  };

  const start = () => {
    if (status === "listening" || status === "recording") return;
    initialize();
    setStatus("listening");
  };

  useEffect(() => {
    if (audioChunks.length > 0)
      setAudioUrl(
        URL.createObjectURL(new Blob(audioChunks, { type: "audio/wav" }))
      );
  }, [audioChunks]);

  return { status, audioUrl, start, stop };
};

export default useMicrophone;
