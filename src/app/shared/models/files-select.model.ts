export interface KnowledgeNode {
  id?: number;
  nameFile: string;
  embedding?: any[];
  content?: string;
  size?: string;
  createAt?: Date;
  embeddings?: any[];
  category?: string;
  children?: KnowledgeNode[];
  numChars?: number;
  numChunks?: number;
  numTokens?: number;
  isProcessing?: string;
}

export interface FileFlatNode {
  expandable: boolean;
  empty: boolean;
  file: KnowledgeNode;
  level: number;
}
