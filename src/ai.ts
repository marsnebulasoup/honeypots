import { AIConversation } from './conversation';
import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { config } from "dotenv";
import input from 'input';

const ENV_FILE_PATH = ".env"
const API_KEY = config({
  path: ENV_FILE_PATH
}).parsed?.OPENAI_API_KEY;

if (!API_KEY) throw new Error(`OPENAI_API_KEY not found in .env file at path "${ENV_FILE_PATH}".`);

const configuration = new Configuration({
  apiKey: API_KEY,
});

const ai = new AIConversation({
  personality: {
    name: "Daniel",
    recipientName: "User",
    description: "Daniel is a friend that enjoys hockey and lives in Canada. Daniel is a bit grumpy, and is always mad at the neighborhood kids, for making too much noise.",
  },
  configuration,
});

(async () => {
  while (true) {
    const message = await ai.talk(await input.text("> "));
    console.log(message);
  }
})();

