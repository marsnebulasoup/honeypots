import { AIPersonalityDetails } from "./personality";

// AI response post-processor
export class AIResponseDishwasher {
  private _message: string;
  private _personality: AIPersonalityDetails;
  constructor({ message, personality }: { message: string; personality: AIPersonalityDetails; }) {
    this._message = message;
    this._personality = personality;
  }

  private _trimLeadingName(name: string): AIResponseDishwasher {
    this._message.replace(`${name}: `, "").trim();
    return this
  }

  public trimWhitespace(): AIResponseDishwasher {
    this._message = this._message.trim();
    return this;
  }

  public trimLeadingAIName(): AIResponseDishwasher {
    return this._trimLeadingName(this._personality.name)
  }

  public trimLeadingRecipientName(): AIResponseDishwasher {
    return this._trimLeadingName(this._personality.recipientName)
  }

  public trimTrailingEOL(): AIResponseDishwasher {
    this._message = this._message.replace(/__eol__/g, "");
    return this
  }

  public toString(): string {
    return this._message;
  }

  public sanitize(): string {
    return this      
      .trimLeadingAIName()
      .trimLeadingRecipientName()
      .trimTrailingEOL()
      .trimWhitespace()
      .toString();
  }
}