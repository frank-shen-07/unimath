export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  topic_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  total_questions: number;
  correct_answers: number;
  created_at: string;
}

export interface PracticeAttempt {
  id: string;
  session_id: string;
  question: string;
  user_answer: string | null;
  correct_answer: string;
  explanation: string;
  is_correct: boolean | null;
  created_at: string;
}

export interface FormulaSheet {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  formulas: FormulaSection[];
  created_at: string;
}

export interface FormulaSection {
  heading: string;
  formulas: Formula[];
}

export interface Formula {
  name: string;
  expression: string;
  description: string;
}

export interface TopicNode {
  id: string;
  user_id: string;
  topic_name: string;
  category: string;
  practice_count: number;
  mastery_score: number;
  position_x: number;
  position_y: number;
}

export interface TopicEdge {
  id: string;
  user_id: string;
  source_node: string;
  target_node: string;
  relationship: string;
}

export interface GeneratedQuestion {
  question: string;
  correctAnswer: string;
  explanation: string;
}
