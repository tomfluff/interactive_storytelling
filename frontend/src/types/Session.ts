import { TStory } from "./Story";

export type TSession = {
  id: string;
  init_time: number;
  last_update: number;
  curr_story: number;
  stories: TStory[];
};
