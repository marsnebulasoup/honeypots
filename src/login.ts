import { TLClient } from './tl/client';
import { StringSession } from "telegram/sessions";
import input from "input";
import { config } from "dotenv";
import * as fs from "fs";

export class TLInit {
  static saveCredentials(apiId, apiHash, session, path) {
    fs.writeFileSync(path, [
      `API_ID=${apiId}`,
      `API_HASH=${apiHash}`,
      `SESSION=${session}`
    ].join("\n"), {

    })
  }

  static async init(path: string) {
    let apiHash, apiId, session;
    const configuration = config({ path: path });
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
      apiId = Number(await input.text("Enter API Id: "));
      apiHash = await input.text("Enter API hash: ");
      session = new StringSession("");
    }
    const client = new TLClient({ apiId, apiHash, session });
    await client.init({
      getPhoneNumberIfNeeded: async () => await input.text("Enter phone number (with country code, e.g. +1): "),
      getPasswordIfNeeded: async () => await input.text("Enter password: "),
      getPhoneCodeIfNeeded: async () => await input.text("Enter phone code: "),
    });
    this.saveCredentials(apiId, apiHash, client.session.save(), path);
    console.log("Login successful!");
    return client;
  }
}