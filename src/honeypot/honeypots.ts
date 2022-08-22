import { Api } from "telegram";
import { HoneyPot, HoneyPotConfig } from "./honeypot";
import { TLClient } from "../tl/client";
import { InputPeerUserArray } from "../tl/input-peer-user-array";

export class HoneyPots {
  private _honeypots: HoneyPot[];
  private _hpConfig: HoneyPotsConfig;
  private _hpFolderName: string;
  private _hpFolderId: number | undefined;
  private _hpUserIds: InputPeerUserArray;
  private _hpCallback: (honeypots: HoneyPot[]) => Promise<void>;
  private _tlClient: TLClient;
  private _isActive: boolean;
  private _isSubscribed: boolean;

  constructor({ tlClient, honeypotFolderName, honeypots = [], onHoneypotChange, config }: {
    tlClient: TLClient;
    honeypotFolderName: string;
    honeypots?: HoneyPot[];
    onHoneypotChange: (honeypots: HoneyPot[]) => Promise<void>;
    config: HoneyPotsConfig;
  }) {
    this._tlClient = tlClient;
    this._honeypots = [];
    this._hpConfig = config;
    this._hpFolderName = honeypotFolderName;
    this._hpUserIds = new InputPeerUserArray();
    this._hpCallback = onHoneypotChange;
    this._isActive = false;
    this._isSubscribed = false;
  }

  async watch(): Promise<void> {
    this._isActive = true;
    if (!this._isSubscribed) { // only subscribe to the client if not already subscribed
      this._tlClient.subscribe({
        eventType: "UpdateDialogFilter",
        callback: this._onFolderUpdate.bind(this),
      });
      this._isSubscribed = true;
    }
    await this._initHpIds();
  }

  async unwatch(): Promise<void> {
    this._isActive = false;
  }

  async destroy(): Promise<void> {
    await this.unwatch();
    this._honeypots.forEach(honeypot => honeypot.destroy());
    this._honeypots.length = 0;
    this._sendHpCallback();
  }

  get honeypots(): HoneyPot[] {
    return this._honeypots;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  private async _initHpIds(): Promise<void> {
    await this._onFolderUpdate(null);
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
    for (let i = 0; i < this._honeypots.length; i++) {
      const honeypot = this._honeypots[i];
      const isInFolder = this._hpUserIds.includes(honeypot.chatId);
      if (!isInFolder) {
        honeypot.destroy();
        this._honeypots.splice(i, 1); // remove honeypot from array
      }
    }

    // Add any new honeypots
    for (const user of this._hpUserIds) {
      if (!this._isAHoneyPot(user)) {
        this._honeypots.push(
          await HoneyPot.create({
            tlClient: this._tlClient,
            chatId: user,
            onUpdate: this._sendHpCallback.bind(this), // notify parent that the honeypots have been updated (new message)
            config: this._hpConfig.honeypotConfig,
          })
        );
      }
    }

    this._sendHpCallback(); // notify parent that the honeypots have been updated (added/removed)   
  }

  private async _sendHpCallback(): Promise<void> {
    await this._hpCallback(this._honeypots);
  }

  private _isAHoneyPot(chatId: Api.InputPeerUser): boolean {
    return !!this._honeypots.find(honeypot => honeypot.chatId.userId.toString() == chatId.userId.toString());
  }
}

export interface HoneyPotsConfig {
  honeypotConfig: HoneyPotConfig;
}