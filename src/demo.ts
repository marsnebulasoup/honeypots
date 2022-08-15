import { TLInit } from './login';
import { HoneyPots } from './honeypots';

const ENV_FILE_PATH = ".tl.env"
const AI_FOLDER_NAME = "HONEYPOT";

(async () => {
  const client = await TLInit.init(ENV_FILE_PATH);
  console.info(`ℹ️ Create a folder in Telegram called ${AI_FOLDER_NAME}, move scammer chats in, and the AI will reply to them.`);
  const honeypots = new HoneyPots({ 
    client: client, 
    honeypotFolderName: AI_FOLDER_NAME 
  });
  await honeypots.watch();  
})();
