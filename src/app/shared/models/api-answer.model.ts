export interface IRequestAnswer {
  conversation_id: string; // session id is a UUID of the conversation that contains all the interactions in base64
  interaction_id: string; // id of one interaction of the conversation sesion with question and answer of the ai in base64
  email_hash: string; // sha256 email_hash in base64
  user: string; // question or prompt of User in base64
  history: {
    user: string; // base64
    assistant: string | string[]; // base64
  }[];
  knowledgebase?: string; // knowledgebase  in base64
  model?: string; // model in base64
  idChat?: number; // idChat in base64
  grounding_context?: string; // grounding_context in base64
  language: string;
}

export interface IRequestCommand {
  idChat: number;
  command: string;
}

export interface IResponseAnswer {
  text: string;
  request: IRequestAnswer;
}

export interface IRequestImage {
  //conversation_id: string; // session id is a UUID of the conversation that contains all the interactions in base64
  //interaction_id: string; // id of one interaction of the conversation sesion with question and answer of the ai in base64
  //email_hash: string; // sha256 email_hash in base64
  prompt: string; // question or prompt of User in base64
  //knowledgebase?: string; // knowledgebase  in base64
  model?: string; // model in base64
  quality?: number;
  compress: boolean;
  preview: boolean;
  idChat: number; // idChat in base64
  uuidMessage?: string; // grounding_context in base64
}

export interface IRequestVision {
  model: string; // model in base64
  idChat: number; // idChat in base64
  formDataImage: FormData;
}

export interface IResponseImage {
  image: string;
}
