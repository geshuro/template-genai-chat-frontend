export interface IRequestFeedback {
  interaction_id: string; // id of one interaction on the conversation sesion in base64
  feedback: string;
  valoration: string[];
  comment: string;
}

export interface IResponseFeedback {}
