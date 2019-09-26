import { IAnswer } from "./IAnswer";

export interface IQuestion {
  id: number;
  title: string;
  description: string;
  answers: IAnswer[];
  author?: string;
}
