import { useState, useEffect } from "react";
import { useDrawingStore, setDrawing } from "../store/drawingStore";

const useFetchDrawing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const data = useDrawingStore.use.drawing();

  const fetchDrawing = async (drawing: string | null) => {
    if (!drawing) return;

    setIsLoading(true);
    setError("");
    try {
      const formdata = new FormData();
      formdata.append("image", drawing);
      formdata.append("src", "camera");
      formdata.append("type", "jpeg");

      // Make API call to upload drawing to the backend
      const response = await fetch("/api/drawing", {
        method: "POST",
        body: formdata,
      });

      if (!response.ok) {
        throw new Error("Failed to upload drawing");
      }

      // Get the returned data from the backend
      const data = await response.json();
      // Update the drawingStore with the information
      setDrawing(data);
    } catch (error: any) {
      setError(error.message);
    }
    setIsLoading(false);
  };

  return { isLoading, error, data, fetchDrawing };
};

export default useFetchDrawing;
