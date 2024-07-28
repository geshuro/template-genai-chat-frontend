export enum ChatType {
  ['RH+'] = 'rh-plus',
  ['CHAT LIBRE'] = 'chat-libre',
  ['IMAGENES'] = 'images',
}

export enum ChatTypeIA {
  image = 'image',
  text = 'text',
  vision = 'vision',
  command = 'command',
}

export enum ChatTypeRole {
  User = 'user',
  Assistant = 'assistant',
}

export type LoginEventParams = {
  success: boolean;
};
export type SendMessageEventParams = {
  // We could use a model enum, but that information comes fomr a backend endpoint.
  model: string;
  module: ChatType;
};
export type ReceiveResponseEventParams = {
  elapsed_time: number;
  model: string;
  module: ChatType;
};
export enum FeedbackType {
  GOOD = 'good',
  BAD = 'bad',
}
export type SendFeedBackEventParams = {
  type?: FeedbackType;
};
export type FinishTourEventParams = {
  /**
   * If the user clicked on the button to not show the tour again on start up.
   */
  no_more: boolean;
};
export type ExitTourEventParams = {
  /**
   * The number of the step at which the user left the tour
   */
  stepNumber: number;
  /**
   * A name for the step at which the user left the tour
   */
  stepName: string;
};
export type OpenAppEventParams = {
  /**
   * Full url used for opening the app.
   */
  url: string;
  /**
   * Whether the user was logged in when the app was opened
   */
  logged_in: boolean;
};

export type SourceAppEventParams = {
  /**
   * Full url used for opening the app.
   */
  url: string;
  /**
   * Destination of the source of the app.
   */
  source: string;
  email: string;
};

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}
export type ChangeThemeEventParams = {
  mode?: ThemeMode;
};
export enum LanguageEnum {
  SPANISH = 'es',
  ENGLISH = 'en',
  PORTUGUESE = 'pt',
}
export type ChangeLangEventParams = {
  language?: LanguageEnum;
};
export enum ErrorReportTypeEnum {
  Error = 'Error',
  Request = 'Request',
}
export type SendErrorReportEventParams = {
  type?: ErrorReportTypeEnum;
};

export type SelectModelEventParams = {
  // Available models are not static, they are obtained from the backend.
  // So we type it as a string.
  name: string;
};

export type SelectKnowledeBaseEventParams = {
  // Available knowledgebase may not be not static, they may be obtained from the backend.
  // So we type it as a string.
  name: string;
};

export type SelectChatType = {
  /**
   * Type of chat selected.
   */
  type?: ChatType;
};
export enum UserKnowledgebaseActionEnum {
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
}

export type UserKnowledgebaseAction = {
  /**
   * name of the knowledgebase
   */
  name?: string;
  /**
   * action to be performed: create, edit, delete.
   */
  action: UserKnowledgebaseActionEnum;
};

export type ClickUploadFile = {
  /**
   * Name of the user knowledged base (Base de Conocimiento),
   * into which the file is meant to be uploaded.
   */
  user_knowledgebase?: string;
};

export type UploadFile = {
  /**
   * Whether the file(s) were successfully uploaded.
   * When uploading multiple files, if one fails this
   * field will be false in a sort of all or none fashion.
   */
  success?: boolean;
  /**
   * Number of files selected by the user to be uploaded.
   */
  filesSelected: number;
  /**
   * Number of files selected by the user to be uploaded.
   */
  filesUploaded: number;
  /**
   * Seconds it took to upload the user files.
   */
  seconds: number;
};

export enum TaggingEvents {
  // GA already imlpements the 'login' event, so we use 'login_app' instead.
  login_app = 'login_app',
  send_message = 'send_message',
  receive_response = 'receive_response',
  send_feedback = 'send_feedback',
  begin_tour = 'begin_tour',
  finish_tour = 'finish_tour',
  exit_tour = 'exit_tour',
  open_tour = 'open_tour',
  open_app = 'open_app',
  source_app = 'source_app',
  close_app = 'close_app',
  new_conversation = 'new_conversation',
  open_conversation = 'open_conversation',
  // GA already imlpements the 'logout' event, so we use 'logout_app' instead.
  logout_app = 'logout_app',
  open_login = 'open_login',
  click_login_button = 'click_login_button',
  change_theme = 'change_theme',
  change_language = 'change_language',
  open_updates = 'open_updates',
  open_error_report = 'open_error_report',
  send_error_report = 'send_error_report',
  open_help_guide = 'open_help_guide',
  export_conversation = 'export_conversation',
  rename_conversation = 'rename_conversation',
  delete_conversation = 'delete_conversation',
  hide_conversations = 'hide_conversations',
  write_message = 'write_message',
  speak_message = 'speak_message',
  copy_response = 'copy_response',
  google_response = 'google_response',
  good_response = 'good_response',
  bad_response = 'bad_response',
  select_model = 'select_model',
  select_knowledgebase = 'select_knowledgebase',
  select_chat_type = 'select_chat_type',
  click_attachment_button = 'click_attachment_button',
  user_knowledgebase_action = 'user_knowledgebase_action',
  click_upload_file = 'click_upload_file',
  upload_file = 'upload_file',
}

export type EventParamsMap = {
  [TaggingEvents.login_app]: LoginEventParams;
  [TaggingEvents.send_message]: SendMessageEventParams;
  [TaggingEvents.receive_response]: ReceiveResponseEventParams;
  [TaggingEvents.send_feedback]: SendFeedBackEventParams;
  [TaggingEvents.begin_tour]: undefined;
  [TaggingEvents.finish_tour]: FinishTourEventParams;
  [TaggingEvents.exit_tour]: ExitTourEventParams;
  [TaggingEvents.open_tour]: undefined;
  [TaggingEvents.open_app]: OpenAppEventParams;
  [TaggingEvents.source_app]: SourceAppEventParams;
  [TaggingEvents.close_app]: undefined;
  [TaggingEvents.new_conversation]: undefined;
  [TaggingEvents.open_conversation]: undefined;
  [TaggingEvents.logout_app]: undefined;
  [TaggingEvents.open_login]: undefined;
  [TaggingEvents.click_login_button]: undefined;
  [TaggingEvents.change_theme]: ChangeThemeEventParams;
  [TaggingEvents.change_language]: ChangeLangEventParams;
  [TaggingEvents.open_updates]: undefined;
  [TaggingEvents.open_error_report]: undefined;
  [TaggingEvents.send_error_report]: SendErrorReportEventParams;
  [TaggingEvents.open_help_guide]: undefined;
  [TaggingEvents.export_conversation]: undefined;
  [TaggingEvents.rename_conversation]: undefined;
  [TaggingEvents.delete_conversation]: undefined;
  [TaggingEvents.hide_conversations]: undefined;
  [TaggingEvents.write_message]: undefined;
  [TaggingEvents.speak_message]: undefined;
  [TaggingEvents.copy_response]: undefined;
  [TaggingEvents.google_response]: undefined;
  [TaggingEvents.select_model]: SelectModelEventParams;
  [TaggingEvents.select_knowledgebase]: SelectKnowledeBaseEventParams;
  [TaggingEvents.select_chat_type]: SelectChatType;
  /**
   * This is the clip icon button in the left side of the chat input.
   */
  [TaggingEvents.click_attachment_button]: undefined;
  [TaggingEvents.user_knowledgebase_action]: UserKnowledgebaseAction;
  /**
   * This is when the user click on the '+' button to upload a file
   * into a user knowledgebase (i.e., 'Base de Conocimiento').
   */
  [TaggingEvents.click_upload_file]: ClickUploadFile;
  /**
   * This is right after the 'click_attachment_button' event but
   * after the files are selected by the user and it fires right after
   * the app finishes processing the selected files.
   */
  [TaggingEvents.upload_file]: UploadFile;
};
