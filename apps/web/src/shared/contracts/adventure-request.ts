/* Generated from Pydantic. Run npm run contracts:generate. */

export type ExperienceId = string;
export type TemplateId = 'crossing-v1';
export type Summary = string;
export type Emotion = 'joy' | 'trust' | 'fear' | 'surprise' | 'sadness' | 'disgust' | 'anger' | 'anticipation';
/**
 * @minItems 1
 * @maxItems 8
 */
export type Emotions = Emotion[];

export interface AdventureRequest {
  experience_id: ExperienceId;
  template_id: TemplateId;
  summary: Summary;
  emotions: Emotions;
}
