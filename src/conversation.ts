import { Configuration } from "openai";
import { AIPersonalityDetails } from "./personality";
import { AIProvider as AIClient } from "./client";
import { MAX_PROMPT_LENGTH } from "./constants";

export class AIConversation {
  private _personality: AIPersonalityDetails;
  private _conversation: AIConversationHistory;
  private _aiClient: AIClient;

  constructor({ personality, configuration }: { personality: AIPersonalityDetails, configuration: Configuration; }) {
    this._personality = personality;
    this._conversation = new AIConversationHistory();
    this._aiClient = new AIClient({
      personality,
      configuration,
    });
  }

  private get _prompt(): AIConversationPrompt {
    return new AIConversationPrompt({
      personality: this._personality,
      conversation: this._conversation,
    });
  }

  public get conversationHistory(): AIConversationHistory {
    return this._conversation;
  }

  public async talk(message: string): Promise<string> {
    let response = new Message({
      sender: this._personality.name,
      body: "NO RESPONSE",
    });


    this._conversation.addMessage(new Message({
      sender: this._personality.recipientName,
      body: message,
    }));

    // console.log(`\n--BEGIN----\n${this._prompt.toString()}\n----END--\n`);


    response = await this._aiClient.getResponse(this._prompt);

    this._conversation.addMessage(response);

    return response.body;
  }
}

export class AIConversationPrompt {
  private _prompt: string;
  private _personality: AIPersonalityDetails;
  constructor({ personality, conversation }: { personality: AIPersonalityDetails; conversation: AIConversationHistory; }) {
    this._personality = personality;
    this._prompt = [
      this._description,

      ``,

      ...conversation.messages
        .slice(-MAX_PROMPT_LENGTH) // only send last 10 messages
        .map(message => message.toString()), // convert to strings

      `${this._personality.name}: `

    ].join("\n");
  }

  private get _description(): string {
    return `The following is a conversation between ${this._personality.recipientName} and ${this._personality.name}. ${this._personality.description}`
  }

  public toString(): string {
    return this._prompt;
  }
}

export class AIConversationHistory {
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

export class Message {
  public body: string;
  public sender: string;

  constructor({ body, sender }: { body: string; sender: string; }) {
    this.body = body;
    this.sender = sender;
  }

  public toString(): string {
    return `${this.sender}: ${this.body}`;
  }
}