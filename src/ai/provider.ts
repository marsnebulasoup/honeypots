import { AIConversationPrompt } from './client';
import { DEFAULT_AI_SETTINGS } from './constants';
import { AIPersonalityDetails } from './personality-details';
import { Configuration, CreateCompletionRequest, CreateCompletionResponse, OpenAIApi } from "openai";
import { AxiosResponse } from 'axios';

export class AIProvider {
  private _openAIApi: OpenAIApi;
  private _personality: AIPersonalityDetails;

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
        "__eol__",
      ],
    }
  };

  public async getResponse(prompt: AIConversationPrompt): Promise<string> {
    let
      message: string,
      rawResponse: AxiosResponse<CreateCompletionResponse, any>;

    try {
      rawResponse = await this._openAIApi.createCompletion({
        prompt: prompt.toString(),
        ...this._aiSettings,
      });
    }
    catch (e) {
      console.error(e.message);
      throw new AIProviderRequestFailedError(e.message);
    }


    message = rawResponse?.data?.choices?.[0]?.text;
    if (!message) {
      throw new AIProviderEmptyResponseError("Response was empty.");
    }

    return message;
  }
}

export class AIProviderRequestFailedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class AIProviderEmptyResponseError extends Error {
  constructor(message: string) {
    super(message);
  }
}