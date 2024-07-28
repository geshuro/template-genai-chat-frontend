export interface ISelectorItem {
  icon?: string;
  label: string;
  value: string;
  speed?: string;
  type?: string;
  default?: boolean;
  roles?: string[];
  rolesKnowledgeDefault?: string[];
  description?: string;
  commands?: string[];
  usedFiles?: boolean;
  disabled?: boolean;
}
