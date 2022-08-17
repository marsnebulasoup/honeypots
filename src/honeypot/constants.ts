import { config } from "dotenv";
import { Configuration } from "openai";
import { AIPersonalityDetails } from "../ai/personality-details";

export const MESSAGE_HISTORY_LIMIT = 10;



export const GET_CONFIG = (): Configuration => {
  const ENV_FILE_PATH = ".env"
  const API_KEY = config({
    path: ENV_FILE_PATH
  }).parsed?.OPENAI_API_KEY;

  if (!API_KEY) throw new Error(`OPENAI_API_KEY not found in .env file at path "${ENV_FILE_PATH}".`);

  const configuration = new Configuration({
    apiKey: API_KEY,
  });
  return configuration;
}