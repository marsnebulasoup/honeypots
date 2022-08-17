import { Message } from "./message";

export class ConversationHistory {
  private _messages: Message[];

  constructor(messages?: Message[]) {
    this._messages = messages || [];
  }

  public get messages(): Message[] {
    return this._messages;
  }

  public addMessage(message: Message): void {
    this._messages.push(message);
  }
}