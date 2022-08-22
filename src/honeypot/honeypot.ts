import { Configuration } from 'openai';
import { ConversationHistory } from '../models/conversation-history';
import { TLClient } from '../tl/client';
import { AIClient } from '../ai/client';
import { Api } from 'telegram';
import { Message } from '../models/message';
import { AIProviderEmptyResponseError, AIProviderRequestFailedError } from '../ai/provider';
import { AIResponseValidationError } from '../ai/validator';

export class HoneyPot {
  private _aiClient: AIClient;
  private _tlClient: TLClient;
  private _conversationHistory: ConversationHistory;
  private _chatId: Api.InputPeerUser;
  private _onUpdate: () => Promise<void>;
  private _config: HoneyPotConfig;
  private _name: string;
  private _recipientName: string;
  private _isActive: boolean;

  private constructor({ aiClient, tlClient, conversationHistory, chatId, onUpdate, config, name, recipientName }: {
    aiClient: AIClient;
    tlClient: TLClient;
    conversationHistory: ConversationHistory;
    chatId: Api.InputPeerUser;
    onUpdate: () => Promise<void>;
    config: HoneyPotConfig;
    name: string;
    recipientName: string;
  }) {
    this._aiClient = aiClient;
    this._tlClient = tlClient;
    this._conversationHistory = conversationHistory;
    this._chatId = chatId;
    this._onUpdate = onUpdate;
    this._config = config;
    this._name = name;
    this._recipientName = recipientName;
    this._isActive = true;
  }

  public static async create({ tlClient, chatId, onUpdate, config }: {
    tlClient: TLClient;
    chatId: Api.InputPeerUser;
    onUpdate: () => Promise<void>;
    config: HoneyPotConfig
  }): Promise<HoneyPot> {
    console.log(`Creating HoneyPot for ${chatId.userId}`);
    const
      name: string = await tlClient.getMyName(),
      recipientName: string = await tlClient.getFirstNameById(chatId),

      conversationHistory: ConversationHistory = await tlClient.getMessageHistory({
        id: chatId,
        limit: config.messageHistoryLimit,
      }),

      aiClient: AIClient = new AIClient({
        personality: {
          name: name,
          recipientName: recipientName,
          description: config.personality(name, recipientName),
        },
        conversation: conversationHistory,
        configuration: config.openai,
        options: {
          messageHistoryLimit: config.messageHistoryLimit,
          aiModel: config.aiModel,
        }
      }),

      honeypot: HoneyPot = new HoneyPot({
        aiClient: aiClient,
        tlClient: tlClient,
        conversationHistory: conversationHistory,
        chatId: chatId,
        onUpdate: onUpdate,
        config: config,
        name: name,
        recipientName: recipientName,
      });

    await honeypot._subscribeToNewMessages();
    return honeypot;
  }

  public async destroy(): Promise<void> {
    console.log(`Destroying HoneyPot for ${this._chatId.userId}`);
    this._isActive = false;
  }

  public get chatId(): Api.InputPeerUser {
    return this._chatId;
  }

  public get conversationHistory(): ConversationHistory {
    return this._conversationHistory;
  }

  public get name(): string {
    return this._name;
  }

  public get recipientName(): string {
    return this._recipientName;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  private async _subscribeToNewMessages(): Promise<void> {
    console.log(`Subscribing to new messages for ${this._chatId.userId}`);
    await this._tlClient.subscribe({
      eventType: "UpdateShortMessage",
      callback: this._onNewMessage.bind(this), // TODO: Maybe it is a good idea to debounce this callback?
    });
  }

  private async _onNewMessage(event: Api.UpdateShortMessage): Promise<void> {
    if (this._isActive) { // checks if the honeypot is still active
      if (event?.userId?.toString() == this._chatId.userId?.toString()) { // checks if the message is in the right chat
        if (event?.out === false) { // checks if the message not outgoing (i.e. incoming)
          console.log("");
          console.group(`${this._chatId.userId}`)
          console.log(`Received new message from ${this._chatId.userId}: '${event.message}'`);
          const message = event?.message;
          if (message) {
            try {
              const aiResponse = await this._aiClient.talk(message);
              this._onUpdate();
              await this._sleep(1000);
              console.log(`Sending AI response: '${aiResponse}'`);
              await this._tlClient.sendMessage({
                id: this._chatId.userId,
                body: aiResponse,
              });
            } catch (e) {
              console.error(e);
              if (e instanceof AIProviderRequestFailedError) {
                console.warn(`AI request failed. Message: '${e.message}'`);
              } else if (e instanceof AIProviderEmptyResponseError) {
                console.warn(`AI returned an empty response.`);
              } else if (e instanceof AIResponseValidationError) {
                console.warn(e.message);
              }
            }
          }
          console.groupEnd();
        } else { // new message is outgoing, i.e., sent by user - add it to the conversation history
          this._conversationHistory.addMessage(
            new Message({
              sender: await this._tlClient.getMyName(),
              body: event.message,
            })
          );
        }
        this._onUpdate(); // notify parent that the conversation history has been updated
      }
    }
  }

  private async _sleep(ms: number): Promise<void> {
    console.log(`Sleeping for ${ms}ms`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface HoneyPotConfig {
  aiModel: string;
  openai: Configuration;
  messageHistoryLimit: number;
  personality: (name: string, recipientName: string) => string;
}