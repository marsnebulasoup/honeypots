import { TLClient } from './client';
import { StringSession } from "telegram/sessions";
import input from "input";
import { config } from "dotenv";
import * as fs from "fs";
import { InputPeerUserArray } from './input-peer-user-array';

const ENV_FILE_PATH = ".tl.env"
const AI_FOLDER_NAME = "FOLDER_TEST";

const saveCredentials = (apiId, apiHash, session) => {
  fs.writeFileSync(ENV_FILE_PATH, [
    `API_ID=${apiId}`,
    `API_HASH=${apiHash}`,
    `SESSION=${session}`
  ].join("\n"), {

  })
}
(async () => {
  // Everything from here...
  let apiHash, apiId, session;
  const configuration = config({ path: ENV_FILE_PATH });
  if (configuration.parsed && configuration.parsed["API_ID"] && configuration.parsed["API_HASH"]) {
    const { API_ID, API_HASH, SESSION } = configuration.parsed
    console.log("Using saved credentials...");
    console.log(" > API_ID", API_ID);
    console.log(" > API_HASH", API_HASH);
    apiId = Number(API_ID);
    apiHash = String(API_HASH);
    session = new StringSession(SESSION || "");
  }
  else {
    apiId = await input.text("Enter API Id: ");
    apiHash = await input.text("Enter API hash: ");
    session = new StringSession("");
  }
  const client = new TLClient({ apiId, apiHash, session });
  await client.init({
    getPhoneNumberIfNeeded: async () => await input.text("Enter phone number: "),
    getPasswordIfNeeded: async () => await input.text("Enter password: "),
    getPhoneCodeIfNeeded: async () => await input.text("Enter phone code: "),
  });
  saveCredentials(apiId, apiHash, client.session.save());
  // ...to here is just to get the API credentials from you







  let scammerFolderId = await client.getFolderIdByName(AI_FOLDER_NAME);
  let scammerUserIds: InputPeerUserArray = await client.getPeersInFolder(scammerFolderId);

  // console.log(await client.getUsernameFromId(scammerUserIds[0]));
  // const history = await client.getMessageHistory('thecatfactsbot', 10);
  // console.log(JSON.stringify(history, null, 2));

  // When chat is added or removed to a folder
  client.subscribe({
    eventType: "UpdateDialogFilter",
    callback: async (event) => {
      // console.log(JSON.stringify(event, null, 2));
      if (event?.id == scammerFolderId) {
        scammerUserIds = new InputPeerUserArray();
        event?.filter?.includePeers?.forEach(peer => {
          if (peer.userId) {
            scammerUserIds.push(peer);
          }
        });
        console.log(`AI folder was updated -> ${JSON.stringify(scammerUserIds, null, 2)}`);
      } else {
        scammerFolderId = await client.getFolderIdByName(AI_FOLDER_NAME);
        scammerUserIds = await client.getPeersInFolder(scammerFolderId);
      }
    }
  });

  // When a new message is received
  client.subscribe({
    eventType: "UpdateShortMessage",
    callback: (event) => {
      // console.log(JSON.stringify(event, null, 2));
      // console.log(JSON.stringify(scammerUserIds, null, 2));
      if (scammerUserIds.includesId(event?.userId)) {
        console.log(`Scammer ${event?.userId} sent a message: ${event?.message}`);
        // client.sendMessage({
        //   id: event?.userId,
        //   body: "/fact"
        // });
      }
    }
  });



})();
