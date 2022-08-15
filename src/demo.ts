import { TLInit } from './login';
import { HoneyPots } from './honeypots';

const ENV_FILE_PATH = ".tl.env"
const AI_FOLDER_NAME = "HONEYPOT";

(async () => {
  const client = await TLInit.init(ENV_FILE_PATH);
  const honeypots = new HoneyPots({ 
    client: client, 
    honeypotFolderName: AI_FOLDER_NAME 
  });
  await honeypots.watch();  
})();
