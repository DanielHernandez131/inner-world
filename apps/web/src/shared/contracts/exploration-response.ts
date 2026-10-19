/* Generated from Pydantic. Run npm run contracts:generate. */

export type Result = ClarificationResult | CompleteResult | InsufficientResult;
export type Status = 'clarification';
export type Id = string;
export type Text = string;
/**
 * @minItems 2
 * @maxItems 5
 */
export type Options = string[];
export type Status1 = 'complete';
export type SchemaVersion = 1;
export type Summary = string;
export type Emotion = 'joy' | 'trust' | 'fear' | 'surprise' | 'sadness' | 'disgust' | 'anger' | 'anticipation';
export type Intensity = number;
export type Explanation = string;
export type SourceMessageId = string;
export type Quote = string;
/**
 * @minItems 1
 * @maxItems 3
 */
export type Evidence = Evidence1[];
/**
 * @maxItems 8
 */
export type Emotions = EmotionReading[];
export type Text1 = string;
/**
 * @maxItems 8
 */
export type Characters = CharacterVoice[];
export type Kind = 'thought' | 'discovery' | 'possibility';
export type Provenance = 'user_quote' | 'user_paraphrase' | 'ai_hypothesis';
export type Text2 = string;
/**
 * @minItems 1
 * @maxItems 5
 */
export type SourceMessageIds = string[];
/**
 * @maxItems 8
 */
export type RelatedEmotions = Emotion[];
/**
 * @maxItems 4
 */
export type Fragments = FragmentCandidate[];
export type Status2 = 'insufficient_context';
export type Explanation1 = string;
export type RequestId = string;

export interface ExplorationResponse {
  result: Result;
  request_id: RequestId;
}
export interface ClarificationResult {
  status: Status;
  question: ClarificationQuestion;
}
export interface ClarificationQuestion {
  id: Id;
  text: Text;
  options: Options;
}
export interface CompleteResult {
  status: Status1;
  analysis: EmotionalAnalysis;
}
export interface EmotionalAnalysis {
  schema_version: SchemaVersion;
  summary: Summary;
  emotions: Emotions;
  characters: Characters;
  fragments: Fragments;
}
export interface EmotionReading {
  emotion: Emotion;
  intensity: Intensity;
  explanation: Explanation;
  evidence: Evidence;
}
export interface Evidence1 {
  source_message_id: SourceMessageId;
  quote: Quote;
}
export interface CharacterVoice {
  emotion: Emotion;
  text: Text1;
}
export interface FragmentCandidate {
  kind: Kind;
  provenance: Provenance;
  text: Text2;
  source_message_ids: SourceMessageIds;
  related_emotions: RelatedEmotions;
}
export interface InsufficientResult {
  status: Status2;
  explanation: Explanation1;
}
