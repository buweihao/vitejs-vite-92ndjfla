export enum LightingMode {
  BRIGHT_FIELD = 'BRIGHT_FIELD',
  DARK_FIELD = 'DARK_FIELD'
}

export type Language = 'en' | 'zh';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ExampleCase {
  id: string;
  name: string;
  description: string;
}