import { ConversationHistory } from '../models/conversation-history';
import { TLClient } from '../tl/client';
import { AIClient } from '../ai/client';
import { Api } from 'telegram';
import { GET_CONFIG, MESSAGE_HISTORY_LIMIT, PERSONALITY } from './constants';

export class HoneyPot {
  private _aiClient: AIClient;
  private _tlClient: TLClient;
  private _conversationHistory: ConversationHistory;
  private _chatId: Api.InputPeerUser;
  private _isActive: boolean;

  private constructor({ aiClient, tlClient, conversationHistory, chatId }: { aiClient: AIClient; tlClient: TLClient; conversationHistory: ConversationHistory, chatId: Api.InputPeerUser; }) {
    this._aiClient = aiClient;
    this._tlClient = tlClient;
    this._conversationHistory = conversationHistory;
    this._chatId = chatId;
    this._isActive = true;
  }

  public static async create({ tlClient, chatId }: { tlClient: TLClient; chatId: Api.InputPeerUser; }): Promise<HoneyPot> {
    console.log(`Creating HoneyPot for ${chatId.userId}`);
    const conversationHistory: ConversationHistory = await tlClient.getMessageHistory({
      id: chatId,
      limit: MESSAGE_HISTORY_LIMIT,
    });
    const aiClient = new AIClient({
      personality: PERSONALITY(await tlClient.getMyName(), await tlClient.getFirstNameById(chatId)), // TODO: Get recipient name and user name from TL
      conversation: conversationHistory,
      configuration: GET_CONFIG(),
    });
    const honeypot = new HoneyPot({
      aiClient: aiClient,
      tlClient: tlClient,
      conversationHistory: conversationHistory,
      chatId: chatId,
    });
    await honeypot._subscribeToNewMessages();
    return honeypot;
  }

  public async destroy(): Promise<void> {
    console.log(`Destroying HoneyPot for ${this._chatId.userId}`);
    // await this._tlClient.unsubscribe({...  // TODO: Unsubscribe from new messages
    this._isActive = false;
  }

  public get chatId(): Api.InputPeerUser {
    return this._chatId;
  }

  private async _subscribeToNewMessages(): Promise<void> {
    console.log(`Subscribing to new messages for ${this._chatId.userId}`);
    await this._tlClient.subscribe({
      eventType: "UpdateShortMessage",
      callback: this._onNewMessage.bind(this), // TODO: Maybe it is a good idea to debounce this callback?
    });
  }

  // TODO: It may be a good idea to check the message history every time a new message is received in case the user has sent a message of their own.
  // Or we could subscribe to messages sent by the user and add them to the conversation history.
  private async _onNewMessage(event: Api.UpdateShortMessage): Promise<void> {
    // TODO: AI responds to your own messages
    if (this._isActive) {
      if (event?.userId?.toString() == this._chatId.userId?.toString()) {
        console.group(`${this._chatId.userId}`)
        console.log(`Received new message from ${this._chatId.userId}: '${event.message}'`);
        const message = event?.message;
        if (message) {
          try {
            const aiResponse = await this._aiClient.talk(message);
            await this._sleep(1000);
            console.log(`Sending AI response: '${aiResponse}'`);
            await this._tlClient.sendMessage({
              id: this._chatId.userId,
              body: aiResponse,
            });
          } catch (e) {
            console.error(e);
          }
        }
        console.groupEnd();
      }
    }
  }

  private async _sleep(ms: number): Promise<void> {
    console.log(`Sleeping for ${ms}ms`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}