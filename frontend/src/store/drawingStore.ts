import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { createSelectors } from "../utils/createSelectors";
import { TDrawing } from "../types/Drawing";

const initialDrawingState: TDrawing[] = [];

export const useDrawingStore = createSelectors(
  create<TDrawing[]>()(
    devtools((set, get) => initialDrawingState, {
      name: "drawing",
    })
  )
);

export const resetDrawings = () => {
  useDrawingStore.setState(initialDrawingState);
};

export const addDrawing = (drawing: TDrawing) => {
  useDrawingStore.setState((state) => [...state, drawing]);
};

export const getDrawing = (id: string) => {
  return useDrawingStore((state) => state.find((d) => d.id === id));
};
