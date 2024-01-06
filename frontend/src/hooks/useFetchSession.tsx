import useAsync from "./useAsync";
import { setSession, useSessionStore } from "../store/sessionStore";
import { useState } from "react";

const useFetchSession = () => {
  const [isFetch, setIsFetch] = useState(false);

  const { error, loading, value } = useAsync(async () => {
    if (!isFetch) return;

    const response = await fetch("/api/session");
    if (!response.ok) throw new Error("Failed to get session");
    const session = await response.json();
    setSession(session);
    setIsFetch(false);
    return session;
  }, [isFetch]);

  const fetchSession = () => {
    setIsFetch(true);
  };

  return { error, loading, value, fetchSession };
};

export default useFetchSession;
