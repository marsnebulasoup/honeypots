import { AIConversationPrompt, Message } from './conversation';
import { DEFAULT_AI_SETTINGS } from './constants';
import { AIPersonalityDetails } from './personality';
import { Configuration, CreateCompletionRequest, OpenAIApi } from "openai";
import { AIResponseDishwasher } from './dishwasher';

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
        "__eol__\n",
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
      // console.log(JSON.stringify(rawResponse.data, null, 2));

      const responseString = rawResponse.data?.choices[0]!?.text
      message.body = new AIResponseDishwasher({
        message: responseString,
        personality: this._personality,
      }).sanitize();
    } catch (e) {
      console.error(e.message);
    }

    return message;
  }
}