export interface IPanelChat {
  label: string;
  subtitle: string;
  mobileDesc: string;
  value: string;
  type: string;
  roles: string[];
  showPromptExamples: boolean;
  localPrompts: boolean;
  showDisclaimer: boolean;
  pathAnswer: string;
  textDisclaimer: string;
  localPathAnswer: string;
  domains?: string[];
  viewLetf: boolean;
  viewRight: boolean;
  iconAssistant?: string;
  iconHistory?: string;
  loading: boolean;
  modelsListValue?: string[];
  cantMessageLoad: number;
  startMessageLoad: number;
  isChatLibre: boolean;
  logo: string;
}
