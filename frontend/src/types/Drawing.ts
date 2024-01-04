import { TEntity } from "./Entity";

export type TColorUsage = {
  color: string;
  usage: number;
};

export type TDrawing = {
  id: string;
  name: string;
  source: "url" | "file" | "camera";
  description: string;
  items: TEntity[];
  colors: TColorUsage[];
  backstory: string;
};
