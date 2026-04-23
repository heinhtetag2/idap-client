export type BuilderQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'short_text'
  | 'long_text'
  | 'scale'
  | 'rating'
  | 'ranking'
  | 'date'
  | 'matrix';

export interface BuilderQuestion {
  id: string;
  text: string;
  type: BuilderQuestionType;
  options: string[];
  required: boolean;
  /** Matrix rows (columns use `options`). Ignored for non-matrix types. */
  rows?: string[];
}

function nextId() {
  return `q_${Math.random().toString(36).slice(2, 9)}`;
}

function q(
  text: string,
  type: BuilderQuestionType,
  options: string[] = [],
  required = true,
): BuilderQuestion {
  return { id: nextId(), text, type, options, required };
}

/**
 * Returns a realistic question set for a survey category.
 * Used to prefill the Survey Builder when editing an existing survey.
 */
export function mockQuestionsFor(category: string): BuilderQuestion[] {
  switch (category) {
    case 'Social':
      return [
        q('Which social platform do you use most frequently?', 'single_choice', ['Facebook', 'Instagram', 'TikTok', 'Twitter / X', 'Other']),
        q('How many hours per day do you spend on social media?', 'single_choice', ['Less than 1h', '1–3h', '3–5h', 'More than 5h']),
        q('Rate your overall trust in social media content', 'scale'),
        q('What type of content engages you most?', 'multiple_choice', ['Videos', 'Photos', 'Articles', 'Live streams', 'Memes']),
        q('What would make you leave a platform?', 'short_text', [], false),
      ];
    case 'Product':
      return [
        q('How often do you use our product?', 'single_choice', ['Daily', 'Weekly', 'Monthly', 'Rarely', 'First time']),
        q('Rate the overall quality of our product', 'scale'),
        q('Which feature do you value most?', 'single_choice', ['Speed', 'Design', 'Reliability', 'Customer support', 'Price']),
        q('How would you describe our product?', 'multiple_choice', ['Innovative', 'Reliable', 'Easy to use', 'Affordable', 'Premium']),
        q('What would you improve?', 'short_text', [], false),
      ];
    case 'Brand':
      return [
        q('How familiar are you with our brand?', 'single_choice', ['Very familiar', 'Somewhat familiar', 'A little', 'Not at all']),
        q('Where did you first hear about us?', 'single_choice', ['Social media', 'Friend or family', 'Advertisement', 'Search engine', 'Other']),
        q('Rate your trust in our brand', 'scale'),
        q('Which word best describes our brand?', 'single_choice', ['Trustworthy', 'Innovative', 'Friendly', 'Professional', 'Premium']),
        q('Any feedback on our branding?', 'short_text', [], false),
      ];
    case 'Market Research':
      return [
        q('Have you heard of our product or service?', 'single_choice', ['Yes', 'No', 'Unsure']),
        q('What factors are most important when choosing a provider?', 'multiple_choice', ['Price', 'Quality', 'Reputation', 'Features', 'Support']),
        q('Rate your overall satisfaction with existing options', 'scale'),
        q('How likely are you to try a new provider in the next 6 months?', 'single_choice', ['Very likely', 'Somewhat likely', 'Neutral', 'Unlikely', 'Very unlikely']),
        q('What would convince you to switch providers?', 'short_text', [], false),
      ];
    case 'Other':
    default:
      return [
        q('Rate your overall satisfaction', 'scale'),
        q('How likely are you to recommend us?', 'single_choice', ['Yes, definitely', 'Probably', 'Maybe', 'Probably not', 'No']),
        q('What do you like most?', 'single_choice', ['Speed', 'Quality', 'Price', 'Customer support', 'Other']),
        q('Any other feedback?', 'short_text', [], false),
      ];
  }
}
