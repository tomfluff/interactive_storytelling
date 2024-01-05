// NOTE: This is not currently used
export type TColorUsage = {
  color: string;
  usage: number;
};

// NOTE: This is not currently used
// Maybe in the future we will set the bounbdiung box of the drawing
export type TBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TDrawing = {
  id: string;
  url?: string;
  source: "url" | "file" | "camera";
  fullname: string;
  shortname: string;
  description: string;
  items: string[];
  backstory: string;
};
