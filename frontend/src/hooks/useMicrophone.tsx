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
  min_speaking_duration: 500,
  detection_interval: 500,
  time_interval: 250,
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
type TMode = "mute" | "speaking" | "silence";

interface IVolumeMeterEventDetail {
  volume: number;
  timestamp: number;
  duration: number;
}

interface IVoiceData {
  mode: TMode;
  isRecording: boolean;
  isSpeechStarted: boolean;
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
    isSpeechStarted: false,
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
    if (
      voiceDataRef.current.preSpeechItemsNum >=
      defaultVolumeConfig.detection_interval / props.time_interval
    ) {
      if (!voiceDataRef.current.isSpeechStarted) {
        console.log(
          "handlePreSpeechProcessing -> Restarting recorder, preSpeechItemsNum: ",
          voiceDataRef.current.preSpeechItemsNum
        );
        recorderRestart();
      }
      voiceDataRef.current.preSpeechItemsNum = 0;
    }
  };

  const handleVolumeDetection = (volume: number) => {
    const detail: IVolumeMeterEventDetail = {
      volume: volume,
      timestamp: Date.now(),
      duration: Date.now() - voiceDataRef.current.speechStart,
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
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current.start();
      setStatus("listening");
      voiceDataRef.current.isRecording = true;
    }
  };

  const recorderPause = () => {
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

  const onMuteEvent = (e: CustomEvent<IVolumeMeterEventDetail>) => {
    // console.log("onMuteEvent -> ", e.detail);
    voiceDataRef.current.mode = "mute";
    // TODO: Maybe do more...
  };

  const onSpeakingEvent = (e: CustomEvent<IVolumeMeterEventDetail>) => {
    // console.log("onSpeakingEvent -> ", e.detail);
    if (!voiceDataRef.current.isSpeechStarted) {
      console.log("onSpeakingEvent -> Speech started");
      setStatus("recording");
      voiceDataRef.current.speechStart = e.detail.timestamp;
      voiceDataRef.current.isSpeechStarted = true;
      voiceDataRef.current.speechItemsNum = 0;
    }
    voiceDataRef.current.silenceItemsNum = 0;
    voiceDataRef.current.mode = "speaking";
    ++voiceDataRef.current.speechItemsNum;
    // TODO: Maybe do more...
  };

  const onSilenceEvent = (e: CustomEvent<IVolumeMeterEventDetail>) => {
    // console.log("onSilenceEvent -> ", e.detail);
    ++voiceDataRef.current.silenceItemsNum;

    // Speech started and max post-speech silence time reached
    if (
      voiceDataRef.current.isSpeechStarted &&
      voiceDataRef.current.silenceItemsNum >=
        defaultVolumeConfig.detection_interval
    ) {
      // Speech not valid: Aborted
      if (e.detail.duration < defaultVolumeConfig.min_speaking_duration) {
        // TODO: Speech aboted
        console.log("onSilenceEvent -> Speech aboted");
      }
      // Speech valid: Ended
      else {
        // TODO: Speech stopped
        console.log("onSilenceEvent -> Speech stopped");
        recorderPause();
      }
      console.log(
        "onSilenceEvent -> Speech ended, silentItemsNum: ",
        voiceDataRef.current.silenceItemsNum
      );
      voiceDataRef.current.isSpeechStarted = false;
    }
  };

  useEffect(() => {
    document.addEventListener("mute", onMuteEvent as EventListener);
    document.addEventListener("silence", onSilenceEvent as EventListener);
    document.addEventListener("speaking", onSpeakingEvent as EventListener);
    const preSpeechTimer = setInterval(
      handlePreSpeechProcessing,
      props.time_interval
    );
    return () => {
      clearInterval(preSpeechTimer);
      document.removeEventListener("mute", onMuteEvent as EventListener);
      document.removeEventListener("silence", onSilenceEvent as EventListener);
      document.removeEventListener(
        "speaking",
        onSpeakingEvent as EventListener
      );
    };
  }, []);

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
      if (voiceDataRef.current.speechItemsNum > 0) {
        voiceDataRef.current.speechItemsNum = 0;
        setAudioChunks(() => [e.data]);
      }
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
