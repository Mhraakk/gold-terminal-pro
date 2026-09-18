/** Wire types for https://github.com/aabolfazl/typesafe-local (System One). */

export type NoulQuestion = {
  type: "noul";
  instructions: string;
  criteria?: { true?: string; false?: string };
};

export type ChoiceQuestion = {
  type: "choice";
  instructions: string;
  /** option id -> description */
  criteria: Record<string, string>;
};

export type ScoreQuestion = {
  type: "score";
  instructions: string;
  /** ordered level descriptions, index 0..n-1 */
  criteria: string[];
};

export type SystemOneQuestion = NoulQuestion | ChoiceQuestion | ScoreQuestion;

export type SystemOneRequest = {
  state: unknown;
  questions: Record<string, SystemOneQuestion>;
  model?: string;
};

export type SystemOneAnswer = {
  type: string;
  value?: unknown;
  confidence?: number;
  raw_mass?: number;
  probabilities?: Record<string, number>;
  debug?: unknown;
  [key: string]: unknown;
};

export type SystemOneResponse = {
  model?: string;
  answers: Record<string, SystemOneAnswer>;
  usage?: Record<string, unknown>;
  [key: string]: unknown;
};
