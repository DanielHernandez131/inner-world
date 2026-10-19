/* Generated from Pydantic. Run npm run contracts:generate. */

export type RequestId = string;
export type ExperienceId = string;
export type TemplateId = 'crossing-v1';
export type Title = string;
export type Introduction = string;
export type ClearingDetail = string;
export type ShelterDetail = string;
export type ArrivalDetail = string;
export type ReflectionQuestion = string;
export type InputTokens = number;
export type OutputTokens = number;

export interface AdventureResponse {
  request_id: RequestId;
  experience_id: ExperienceId;
  template_id: TemplateId;
  personalization: AdventurePersonalization;
  usage: TokenUsage | null;
}
export interface AdventurePersonalization {
  title: Title;
  introduction: Introduction;
  clearing_detail: ClearingDetail;
  shelter_detail: ShelterDetail;
  arrival_detail: ArrivalDetail;
  reflection_question: ReflectionQuestion;
}
export interface TokenUsage {
  input_tokens: InputTokens;
  output_tokens: OutputTokens;
}
