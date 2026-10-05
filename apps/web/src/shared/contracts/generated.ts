/* Generated from the Pydantic contract. Run npm run contracts:generate. */

export type SchemaVersion = 1;
export type Summary = string;
/**
 * @maxItems 8
 */
export type Emotions =
  | []
  | [EmotionReading]
  | [EmotionReading, EmotionReading]
  | [EmotionReading, EmotionReading, EmotionReading]
  | [EmotionReading, EmotionReading, EmotionReading, EmotionReading]
  | [EmotionReading, EmotionReading, EmotionReading, EmotionReading, EmotionReading]
  | [EmotionReading, EmotionReading, EmotionReading, EmotionReading, EmotionReading, EmotionReading]
  | [EmotionReading, EmotionReading, EmotionReading, EmotionReading, EmotionReading, EmotionReading, EmotionReading]
  | [
      EmotionReading,
      EmotionReading,
      EmotionReading,
      EmotionReading,
      EmotionReading,
      EmotionReading,
      EmotionReading,
      EmotionReading,
    ];
export type Emotion = 'joy' | 'trust' | 'fear' | 'surprise' | 'sadness' | 'disgust' | 'anger' | 'anticipation';
export type Intensity = number;
export type Explanation = string;
/**
 * @minItems 1
 * @maxItems 3
 */
export type Evidence = [Evidence1] | [Evidence1, Evidence1] | [Evidence1, Evidence1, Evidence1];
export type SourceMessageId = string;
export type Quote = string;
/**
 * @maxItems 8
 */
export type Characters =
  | []
  | [CharacterVoice]
  | [CharacterVoice, CharacterVoice]
  | [CharacterVoice, CharacterVoice, CharacterVoice]
  | [CharacterVoice, CharacterVoice, CharacterVoice, CharacterVoice]
  | [CharacterVoice, CharacterVoice, CharacterVoice, CharacterVoice, CharacterVoice]
  | [CharacterVoice, CharacterVoice, CharacterVoice, CharacterVoice, CharacterVoice, CharacterVoice]
  | [CharacterVoice, CharacterVoice, CharacterVoice, CharacterVoice, CharacterVoice, CharacterVoice, CharacterVoice]
  | [
      CharacterVoice,
      CharacterVoice,
      CharacterVoice,
      CharacterVoice,
      CharacterVoice,
      CharacterVoice,
      CharacterVoice,
      CharacterVoice,
    ];
export type Text = string;
/**
 * @maxItems 4
 */
export type Fragments =
  | []
  | [FragmentCandidate]
  | [FragmentCandidate, FragmentCandidate]
  | [FragmentCandidate, FragmentCandidate, FragmentCandidate]
  | [FragmentCandidate, FragmentCandidate, FragmentCandidate, FragmentCandidate];
export type Kind = 'thought' | 'discovery' | 'possibility';
export type Provenance = 'user_quote' | 'user_paraphrase' | 'ai_hypothesis';
export type Text1 = string;
/**
 * @minItems 1
 * @maxItems 5
 */
export type SourceMessageIds =
  | [string]
  | [string, string]
  | [string, string, string]
  | [string, string, string, string]
  | [string, string, string, string, string];
/**
 * @maxItems 8
 */
export type RelatedEmotions =
  | []
  | [Emotion]
  | [Emotion, Emotion]
  | [Emotion, Emotion, Emotion]
  | [Emotion, Emotion, Emotion, Emotion]
  | [Emotion, Emotion, Emotion, Emotion, Emotion]
  | [Emotion, Emotion, Emotion, Emotion, Emotion, Emotion]
  | [Emotion, Emotion, Emotion, Emotion, Emotion, Emotion, Emotion]
  | [Emotion, Emotion, Emotion, Emotion, Emotion, Emotion, Emotion, Emotion];

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
  text: Text;
}
export interface FragmentCandidate {
  kind: Kind;
  provenance: Provenance;
  text: Text1;
  source_message_ids: SourceMessageIds;
  related_emotions: RelatedEmotions;
}
