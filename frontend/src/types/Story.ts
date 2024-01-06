import { TDrawing } from "./Drawing";
import { TEntity } from "./Entity";
import { TPremise } from "./Premise";

export type TAnalytics = {
  entities: TEntity[];
  intensity: string;
  emotion: string;
  positioning: string;
  complexity: string;
};

export type TChoice = {
  id: number;
  text: string;
  description: string;
};

export type TStoryPart = {
  id: number;
  time: string;
  trigger: string;
  text: string;
  image: string;
  choices: TChoice[];
  analytics: TAnalytics;
};

export type TStory = {
  id: string;
  drawing: TDrawing;
  init_time: string;
  premise: TPremise;
  parts: TStoryPart[];
};
