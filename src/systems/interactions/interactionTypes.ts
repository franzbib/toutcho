export type InteractionMetadata = {
  cefr: 'B1';
  skillType: 'speaking' | 'reading' | 'navigation';
  linguisticFocus: string;
  registerFocus: string;
  missionId: string;
  tags: string[];
};

export type InfoInteractionDefinition = {
  id: string;
  kind: 'info';
  title: string;
  speaker?: string;
  body: string[];
};

export type LanguageOption = {
  id: string;
  text: string;
  feedback: string;
  penaltySeconds: number;
};

export type LanguageInteractionDefinition = {
  id: string;
  kind: 'choice';
  context: string;
  prompt: string;
  speaker?: string;
  options: LanguageOption[];
  correctOptionId: string;
  explanation: string;
  retryOnIncorrect: boolean;
  successText: string;
  metadata: InteractionMetadata;
};

export type InteractionDefinition = InfoInteractionDefinition | LanguageInteractionDefinition;

