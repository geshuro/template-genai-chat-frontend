export interface IMessage {
  id: number;
  idChat?: number;
  unique?: string;
  isNew?: boolean;
  text?: string;
  feedback?: string;
  badComment?: string;
  preselectComment?: string;
  activeFeedback?: number;
  questionAndAnswers?: IQuestionAndAnswers;
  files?: File[] | any[];
  selectedToggleMultiple?: string[];
  sendFeedback?: boolean;
  timeResponse: number;
  model: string;
  createdAt: Date;
}

export interface IQuestionAndAnswers {
  user: string;
  assistant: string | string[];
  unique?: string;
  idAssistant?: number;
  idUser?: number;
}

export interface IFile {
  id: number;
  size?: number;
  name: string;
  type?: string;
  createAt?: Date;
}

export interface IQuestion {
  question: string;
  files?: IFile[];
  isVision?: boolean;
  preview?: Blob[];
  unique?: string;
}

export interface IMessageInteraction {
  role: string;
  content?: string | Blob[] | IGridImage[] | string[];
  text: string;
  type: string; // Text, Image, Video, Vision
  files?: IFile[];
  isVision?: boolean;
  preview?: Blob[];
  interaction: IMessage;
  isEdit?: boolean;
  urls?: string[] | IGridImage[];
}

export interface IChat {
  id: number;
  title: string;
  createAt: Date;
  favorite: boolean;
  emoji: string;
  unique: string;
  baseKnowledge: string;
  model: string;
  loading: boolean;
  chat: string;
  activate?: boolean;
  menu?: boolean;
  period?: string;
}

export interface IGridImage {
  src: string;
  position: number;
  alt: string;
  first: boolean;
  last: boolean;
}

export interface IModelsResponse {
  kind: string;
  type: string;
  name: string;
  speed: string;
  default: boolean;
}
export interface IClickEventHistory {
  chat: IChat | undefined;
  refresh: boolean;
}

export interface IResponseFiles {
  knowledgeBase: IKnowledgeBase[];
}

export interface IKnowledgeBase {
  embeddings: {
    content: string;
    embedding: number[];
  }[];
  category?: string;
  fileName: string;
  content?: string;
  numChars?: number;
  numChunks?: number;
  numTokens?: number;
  isProcessing?: string;
}
