export interface BaseChallenge {
  difficulty: string;
  id: string;
  createdAt: number;
  title: string;
  description: string;
  provider: string;
  totalTokens: number;
  ownerId: string;
  language: string;
}

export interface Question {
  id: string;
  challengeId: string;
  questionText: string;
}

export interface Option {
  id: string;
  description: string;
  questionId: string;
  isCorrect: boolean;
}

interface FullQuestion extends Question {
  options: Option[];
}
export interface FullChallenge extends BaseChallenge {
  questions: FullQuestion[];
}
