/*
 * Custom hook to fetch premise from backend.
 * It gets the promise list for the given drawing.
 * The premise list is stored in the 'data' field and can be accessed.
 *
 * Usage example:
 * const { isLoading, error, data, fetchPremise } = useFetchPremise();
 * fetchPremise(drawing); // drawing is a TDrawing type
 *
 */

import { useState, useEffect } from "react";
import { TCharacter, TDrawing } from "../types/Drawing";
import { TPremise } from "../types/Premise";

const useFetchPremise = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<TPremise[] | null>(null);

  const fetchPremise = async (character: TCharacter) => {
    if (!character) return;
    if (isLoading) return;

    setIsLoading(true);
    setError("");
    try {
      // Make API call to upload drawing to the backend
      const response = await fetch("/api/premise", {
        method: "POST",
        body: JSON.stringify(character),
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
