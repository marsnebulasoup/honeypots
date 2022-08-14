import { HoneyPot } from './honeypot/honeypot';
import { TLInit } from './login';
import * as fs from "fs";
import { InputPeerUserArray } from './tl/input-peer-user-array';
import { Api } from 'telegram';

const ENV_FILE_PATH = ".tl.env"
const AI_FOLDER_NAME = "HONEYPOT";

const saveCredentials = (apiId, apiHash, session) => {
  fs.writeFileSync(ENV_FILE_PATH, [
    `API_ID=${apiId}`,
    `API_HASH=${apiHash}`,
    `SESSION=${session}`
  ].join("\n"), {

  })
}
(async () => {
  const client = await TLInit.init(ENV_FILE_PATH);
  let honeypots: HoneyPot[] = [];

  let scammerFolderId = await client.getFolderIdByName(AI_FOLDER_NAME);
  let scammerUserIds: InputPeerUserArray = await client.getPeersInFolder(scammerFolderId);

  const refreshHoneyPots = async () => {
    // Remove honeypots not in the scammer folder
    honeypots = honeypots.filter((honeypot, index) => {
      const isInFolder = scammerUserIds.includes(honeypot.chatId);
      if(!isInFolder) {
        honeypot.destroy();
      }
      return isInFolder;
    });

    // Add any new honeypots
    scammerUserIds.forEach(async (user) => {
      if (!honeypots.find(honeypot => honeypot.chatId.userId.toString() == user.userId.toString())) {
        honeypots.push(
          await HoneyPot.create({
            tlClient: client,
            chatId: user,
          })
        );
      }
    });
  }

  refreshHoneyPots();

  // When chat is added or removed to a folder
  client.subscribe({
    eventType: "UpdateDialogFilter",
    callback: async (_: Api.UpdateDialogFilter) => {
      // console.log(JSON.stringify(_, null, 2));
      scammerFolderId = await client.getFolderIdByName(AI_FOLDER_NAME); // search for folder id in case it was deleted or hasn't been created yet
      if (scammerFolderId) {
        scammerUserIds = await client.getPeersInFolder(scammerFolderId);
        await refreshHoneyPots();
        // console.log(`AI folder was updated -> ${JSON.stringify(scammerUserIds, null, 2)}`);
      }
    }
  });
})();
