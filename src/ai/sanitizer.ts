import { AIResponseValidator } from './validator';
import { AIPersonalityDetails } from "./personality-details";

// AI response post-processor
export class AIResponseSanitizer {
  private _message: string;
  private _personality: AIPersonalityDetails;
  constructor({ message, personality }: { message: string; personality: AIPersonalityDetails; }) {
    this._message = message;
    this._personality = personality;
  }

  private _trimLeadingName(name: string): AIResponseSanitizer {
    this._message.replace(`${name}: `, "").trim();
    return this
  }

  public trimWhitespace(): AIResponseSanitizer {
    this._message = this._message.trim();
    return this;
  }

  public trimLeadingAIName(): AIResponseSanitizer {
    return this._trimLeadingName(this._personality.name)
  }

  public trimLeadingRecipientName(): AIResponseSanitizer {
    return this._trimLeadingName(this._personality.recipientName)
  }

  public trimTrailingEOL(): AIResponseSanitizer {
    this._message = this._message.replace(/__eol__/g, "");
    return this
  }

  public toString(): string {
    return this._message;
  }

  public sanitize(): string {
    // eslint-disable-next-line no-useless-catch
    try {
      new AIResponseValidator({ message: this._message, personality: this._personality }).isValid();
    } catch (e) {
      throw e;
    }

    return this
      .trimLeadingAIName()
      .trimLeadingRecipientName()
      .trimTrailingEOL()
      .trimWhitespace()
      .toString();
  }
}