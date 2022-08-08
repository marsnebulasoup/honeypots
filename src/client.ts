import { AIConversationPrompt, Message } from './conversation';
import { DEFAULT_AI_SETTINGS } from './constants';
import { AIPersonalityDetails } from './personality';
import { Configuration, CreateCompletionRequest, OpenAIApi } from "openai";

export class AIProvider {
  private _openAIApi: OpenAIApi;
  private _personality: AIPersonalityDetails;
  // we could have an array for chat history here

  constructor({ personality, configuration }: { personality: AIPersonalityDetails; configuration: Configuration; }) {
    this._openAIApi = new OpenAIApi(configuration);
    this._personality = personality;
  }

  private get _aiSettings(): CreateCompletionRequest {
    return {
      ...DEFAULT_AI_SETTINGS,
      stop: [ // max of 4 stop words or this will fail
        `${this._personality.name}:`,
        `${this._personality.recipientName}: `,
        ".\n",
        "?\n",
      ],
    }
  };

  public async getResponse(prompt: AIConversationPrompt): Promise<Message> {
    // Get response from OpenAI; incomplete
    const message = new Message({
      sender: this._personality.name,
      body: "RESPONSE PLACEHOLDER - THIS IS NOT FROM OPENAI",
    });

    try {     
      const rawResponse = await this._openAIApi.createCompletion({
        prompt: prompt.toString(),
        ...this._aiSettings,
      });
      // Format response, etc      
      const responseString = rawResponse.data.choices[0].text.trim();
      message.body = responseString.replace(this._personality.name, "").trim();
    } catch (e) {
      console.error(e.message);
    }

    return message;
  }
}