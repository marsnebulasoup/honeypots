import { CreateCompletionRequest } from "openai";

export const DA_VINCI = "text-davinci-002";      // Best (most expensive) engine
export const CURIE = "text-curie-001";
export const BABBAGE = "text-babbage-001";
export const ADA = "text-ada-001";               // Worst (cheapest) AI engine
export const CUSTOM_CURIE = "curie:ft-honeypot-2022-08-09-23-43-05"

export const MAX_PROMPT_LENGTH = 10; // max number of messages to send to OpenAI per request

export const DEFAULT_AI_SETTINGS: CreateCompletionRequest = {
  model: CUSTOM_CURIE,
  temperature: 0.75,
  top_p: 1,
  frequency_penalty: 1,
  presence_penalty: 1.2,
  max_tokens: 1000,
}