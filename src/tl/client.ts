import { InputPeerUserArray } from './input-peer-user-array';
import { CONNECTION_RETRIES } from './constants';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { BigInteger } from 'big-integer';
import { EntityLike } from 'telegram/define';
import { Message } from '../models/message';
import { ConversationHistory } from '../models/conversation-history';

export class TLClient {
  private _apiId: number;
  private _apiHash: string;
  private _session: StringSession;
  private _client: TelegramClient;

  constructor({ apiId, apiHash, session = new StringSession("") }: { apiId: number; apiHash: string; session?: StringSession; }) {
    this._apiId = apiId;
    this._apiHash = apiHash;
    this._session = session;

    this._client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: CONNECTION_RETRIES,
    });
  }

  public get isReady(): Promise<boolean> {
    return this._client.checkAuthorization();
  }

  public get session(): StringSession {
    return this._session;
  }

  async init({ getPhoneNumberIfNeeded, getPasswordIfNeeded, getPhoneCodeIfNeeded }: {
    getPhoneNumberIfNeeded: () => Promise<string>;
    getPasswordIfNeeded: () => Promise<string>;
    getPhoneCodeIfNeeded: () => Promise<string>;
  }): Promise<void> {
    await this._client.start({
      phoneNumber: getPhoneNumberIfNeeded,
      password: getPasswordIfNeeded,
      phoneCode: getPhoneCodeIfNeeded,
      onError: (e) => {
        throw new TLClientAuthFailedError(`Authentication Failed. Message: ${e.message}`);
      },
    });
  }

  async subscribe({ callback, eventType }: { callback: (event: any) => void; eventType?: string; }) {
    if (await this.isReady) {
      this._client.addEventHandler((event: any) => {
        if (!eventType || event?.className === eventType) {
          callback(event);
        }
      })
    } else {
      throw new TLClientNotReadyError();
    }
  }

  async sendTestMessage(): Promise<void> {
    if (await this.isReady) {
      await this._client.sendMessage("me", {
        message: `Test message sent on ${new Date().toLocaleDateString()}`
      });
    } else {
      throw new TLClientNotReadyError();
    }
  }

  async sendMessage({ id, body }: { id: BigInteger; body: string; }): Promise<void> {
    if (await this.isReady) {
      await this._client.sendMessage(id, {
        message: body
      });
    } else {
      throw new TLClientNotReadyError();
    }
  }

  async getFolderIdByName(name: string): Promise<number | undefined> {
    if (await this.isReady) {
      const folders: Api.TypeDialogFilter[] = await this._client.invoke(new Api.messages.GetDialogFilters());
      const folder: Api.TypeDialogFilter = folders.find(folder => "title" in folder && folder.title == name)
      return folder && ("id" in folder ? folder.id : undefined);
    } else {
      throw new TLClientNotReadyError();
    }
  }

  async getPeersInFolder(id: number): Promise<InputPeerUserArray> {
    const folders: Api.TypeDialogFilter[] = await this._client.invoke(new Api.messages.GetDialogFilters());
    const folder: Api.TypeDialogFilter = folders.find(folder => "id" in folder && folder.id == id)
    return new InputPeerUserArray(
      ...folder && "includePeers" in folder
        ? folder.includePeers.filter((peer): peer is Api.InputPeerUser => "userId" in peer) //flatMap((peer) => "userId" in peer ? [peer.userId] : []) // Get all userIds from the folder
        : [] // Return an empty array if the folder is empty
    );
  }

  async getFirstNameById(id: EntityLike): Promise<string> {
    if (await this.isReady) {
      const users: Api.TypeUser[] = await this._client.invoke(
        new Api.users.GetUsers({
          id: [id],
        })
      );
      const user = users
        .filter((user): user is Api.User & { firstName: string } => true)
        .find(user => user.firstName);

      return user?.firstName || "No first name"; // TODO: Handle no first name
    } else {
      throw new TLClientNotReadyError();
    }
  }

  async getMyName(): Promise<string> {
    if (await this.isReady) {
      return this.getFirstNameById(new Api.InputUserSelf())
    } else {
      throw new TLClientNotReadyError();
    }
  }

  async getMessageHistory({ id, limit }: { id: Api.InputPeerUser; limit: number; }): Promise<ConversationHistory> {
    if (await this.isReady) {
      let messages: Message[] = [];
      const history: Api.messages.TypeMessages = await this._client.invoke(
        new Api.messages.GetHistory({
          peer: id,
          limit: limit,
        })
      );

      if ("messages" in history) {
        const myName: string = await this.getMyName();
        const theirName: string = await this.getFirstNameById(id);
        messages = history.messages
          .filter((message): message is Api.Message & { peerId: Api.PeerUser } => true)
          .map(message => {
            return new Message({
              sender: message.fromId
                ? /* me */ myName
                : /* them */ theirName,
              body: message.message,
            })
          })
          .reverse();
      }
      return new ConversationHistory(messages);
    } else {
      throw new TLClientNotReadyError();
    }
  }
}

export class TLClientAuthFailedError extends Error {
  constructor(message?: string) {
    super(message || "Authentication Failed");
  }
}

export class TLClientNotReadyError extends Error {
  constructor(message?: string) {
    super(message || "Client is not ready");
  }
}