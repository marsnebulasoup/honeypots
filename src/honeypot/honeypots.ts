import { Api } from "telegram";
import { HoneyPot, HoneyPotConfig } from "./honeypot";
import { TLClient } from "../tl/client";
import { InputPeerUserArray } from "../tl/input-peer-user-array";

export class HoneyPots {
  private _honeypots: HoneyPot[] = [];
  private _hpConfig: HoneyPotsConfig;
  private _hpFolderName: string;
  private _hpFolderId: number | undefined;
  private _hpUserIds: InputPeerUserArray;
  private _tlClient: TLClient;
  private _isActive: boolean;
  private _isSubscribed: boolean;

  constructor({ client, honeypotFolderName, config }: { client: TLClient; honeypotFolderName: string; config: HoneyPotsConfig; }) {
    this._tlClient = client;
    this._hpConfig = config;
    this._hpFolderName = honeypotFolderName;
    this._hpUserIds = new InputPeerUserArray();
    this._isActive = false;
    this._isSubscribed = false;
  }

  async watch(): Promise<void> {
    this._isActive = true;
    this._initHpIds();
    if (!this._isSubscribed) { // only subscribe to the client if not already subscribed
      this._tlClient.subscribe({
        eventType: "UpdateDialogFilter",
        callback: this._onFolderUpdate.bind(this),
      });
      this._isSubscribed = true;
    }
  }

  async unwatch(): Promise<void> {
    this._isActive = false;
  }

  async destroy(): Promise<void> {
    await this.unwatch();
    this._honeypots.forEach(honeypot => honeypot.destroy());
    this._honeypots = [];
  }

  private async _initHpIds(): Promise<void> {
    this._onFolderUpdate(null);
  }

  private async _onFolderUpdate(_: Api.UpdateDialogFilter | null): Promise<void> {
    if (this._isActive) {
      this._hpFolderId = await this._tlClient.getFolderIdByName(this._hpFolderName); // search for folder id in case it was deleted or hasn't been created yet
      this._hpUserIds = await this._tlClient.getPeersInFolder(this._hpFolderId);
      await this._refreshHoneyPots();
    }
  }

  private async _refreshHoneyPots(): Promise<void> {
    // Remove honeypots not in the scammer folder
    this._honeypots = this._honeypots.filter((honeypot, index) => {
      const isInFolder = this._hpUserIds.includes(honeypot.chatId);
      if (!isInFolder) {
        honeypot.destroy();
      }
      return isInFolder;
    });

    // Add any new honeypots
    this._hpUserIds.forEach(async (user) => {
      if (!this._isAHoneyPot(user)) {
        this._honeypots.push(
          await HoneyPot.create({
            tlClient: this._tlClient,
            chatId: user,
            config: this._hpConfig.honeypotConfig,
          })
        );
      }
    });
  }

  private _isAHoneyPot(chatId: Api.InputPeerUser): boolean {
    return !!this._honeypots.find(honeypot => honeypot.chatId.userId.toString() == chatId.userId.toString());
  }
}

interface HoneyPotsConfig {
  honeypotConfig: HoneyPotConfig;
}