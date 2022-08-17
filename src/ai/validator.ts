import { AIPersonalityDetails } from "./personality-details";

// AI response post-processor
export class AIResponseValidator {
  private _message: string;
  private _personality: AIPersonalityDetails;
  constructor({ message, personality }: { message: string; personality: AIPersonalityDetails; }) {
    this._message = message;
    this._personality = personality;
  }

  private _checkIfNotOnlySpecialCharacters(): boolean {
    if(this._message.replace(/[^A-Za-z0-9]/gm, "").length > 0) {
      return true;
    }
    throw new AIResponseValidationError(`AI response is only special characters: "${this._message}"`);
  }

  public isValid(): boolean {
    return this._checkIfNotOnlySpecialCharacters();
  }
}

export class AIResponseValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}