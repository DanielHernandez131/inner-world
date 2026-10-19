/* Generated from Pydantic. Run npm run contracts:generate. */

export type ExperienceId = string;
export type Id = string;
export type Text = string;
export type Id1 = string;
export type Text1 = string;
/**
 * @minItems 2
 * @maxItems 5
 */
export type Options = string[];
/**
 * @maxItems 2
 */
export type Answers = ExplorationAnswer[];
export type FinishNow = boolean;

export interface ExplorationRequest {
  experience_id: ExperienceId;
  story: SourceMessage;
  answers: Answers;
  finish_now?: FinishNow;
}
export interface SourceMessage {
  id: Id;
  text: Text;
}
export interface ExplorationAnswer {
  question: ClarificationQuestion;
  message: SourceMessage;
}
export interface ClarificationQuestion {
  id: Id1;
  text: Text1;
  options: Options;
}
