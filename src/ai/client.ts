import { AIResponseValidationError } from './validator';
import { Configuration } from "openai";
import { AIPersonalityDetails } from "./personality-details";
import { AIProvider as AIProvider, AIProviderEmptyResponseError, AIProviderRequestFailedError } from "./provider";
import { MAX_PROMPT_LENGTH } from "./constants";
import { AIResponseSanitizer } from "./sanitizer";
import { Message } from '../models/message';
import { ConversationHistory } from '../models/conversation-history';

export class AIClient {
  private _personality: AIPersonalityDetails;
  private _conversation: ConversationHistory;
  private _aiProvider: AIProvider;

  constructor({ personality, conversation, configuration }: { personality: AIPersonalityDetails, conversation: ConversationHistory, configuration: Configuration; }) {
    this._personality = personality;
    this._conversation = conversation;
    this._aiProvider = new AIProvider({
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

  public get conversationHistory(): ConversationHistory {
    return this._conversation;
  }

  public async talk(message: string): Promise<string> {
    const response = new Message({
      sender: this._personality.name,
      body: "NO RESPONSE",
    });


    this._conversation.addMessage(new Message({
      sender: this._personality.recipientName,
      body: message,
    }));

    console.log(`\n--BEGIN-\n${this._prompt.toString()}\n----END--\n`);

    try {
      const responseString = await this._aiProvider.getResponse(this._prompt);

      response.body = new AIResponseSanitizer({
        message: responseString,
        personality: this._personality,
      }).sanitize();

      this._conversation.addMessage(response);
    } catch (e) {
      // TODO: Properly handle these errors rather than just displaying them.
      if (e instanceof AIProviderRequestFailedError) {
        response.body = `AI request failed. Message: '${e.message}'`;
      } else if (e instanceof AIProviderEmptyResponseError) {
        response.body = `AI returned an empty response.`;
      } else if (e instanceof AIResponseValidationError) {
        response.body = e.message;
      }
    }
    return response.body;
  }
}

export class AIConversationPrompt {
  private _prompt: string;
  private _personality: AIPersonalityDetails;
  constructor({ personality, conversation }: { personality: AIPersonalityDetails; conversation: ConversationHistory; }) {
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