export interface GeminiChallengeResponse {
  title: string;
  description: string;
  questions: Question[];
}

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}
