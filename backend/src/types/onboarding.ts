// Database types
export interface OnboardingQuestion {
  id: number;
  question_text: string;
  question_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface OnboardingOption {
  id: number;
  question_id: number;
  option_text: string;
  option_order: number;
  created_at: Date;
}

export interface OnboardingResponse {
  id: number;
  user_id: string | null;
  session_id: string | null;
  question_id: number;
  option_id: number;
  answered_at: Date;
}

// API request/response types
export interface QuestionOption {
  id: number;
  text: string;
  order: number;
}

export interface Question {
  id: number;
  question: string;
  order: number;
  options: QuestionOption[];
}

export interface GetQuestionsResponse {
  success: boolean;
  data: Question[];
}

export interface UserResponse {
  questionId: number;
  optionId: number;
}

export interface SubmitResponsesRequest {
  sessionId: string;
  responses: UserResponse[];
}

export interface SubmitResponsesResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    completedAt: string;
    totalQuestions: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
