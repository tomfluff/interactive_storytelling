import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { createSelectors } from "../utils/createSelectors";
import { TDrawing } from "../types/Drawing";

const initialDrawingState = {
  drawing: null as TDrawing | null,
  archive: [] as TDrawing[],
};

export const useDrawingStore = createSelectors(
  create<typeof initialDrawingState>()(
    devtools((set, get) => initialDrawingState, {
      name: "drawing",
    })
  )
);

export const setDrawing = (drawing: TDrawing) => {
  useDrawingStore.setState((state) => {
    if (state.drawing) {
      state.archive.push(state.drawing);
    }
    return {
      ...state,
      drawing,
    };
  });
};
