import { useState, useEffect } from "react";
import { useDrawingStore, setDrawing } from "../store/drawingStore";
import { TDrawing } from "../types/Drawing";
import { TPremise } from "../types/Story";

const useFetchPremise = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<TPremise[] | null>(null);

  const fetchPremise = async (drawing: TDrawing) => {
    if (!drawing) return;

    setIsLoading(true);
    setError("");
    try {
      // Make API call to upload drawing to the backend
      const response = await fetch("/api/premise", {
        method: "POST",
        body: JSON.stringify(drawing),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get premise");
      }

      // Get the returned data from the backend
      const data = await response.json();
      setData(data as TPremise[]);
    } catch (error: any) {
      setError(error.message);
    }
    setIsLoading(false);
  };

  return { isLoading, error, data, fetchPremise };
};

export default useFetchPremise;
