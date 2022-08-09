import { CreateCompletionRequest } from "openai";

const DA_VINCI = "text-davinci-002";      // Best (most expensive) engine
const CURIE = "text-curie-001";
const BABBAGE = "text-babbage-001";
const ADA = "text-ada-001";               // Worst (cheapest) AI engine

export const MAX_PROMPT_LENGTH = 10; // max number of messages to send to OpenAI per request

export const DEFAULT_AI_SETTINGS: CreateCompletionRequest = {
  model: CURIE,
  temperature: 0.75,
  top_p: 1,
  frequency_penalty: 1,
  presence_penalty: 1.2,
  max_tokens: 1000,
}