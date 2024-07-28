import { IFile } from './chat-interaction.model';

export interface ICreateMessage {
  idChat: number;
  content: string | string[] | Blob[];
  text: string;
  role: string;
  type: string;
  feedback?: string;
  files?: IFile[];
  unique?: string;
  timeResponse: number;
  model: string;
  idAnswer?: number;
  isVision?: boolean;
  urls?: string[];
}
