import { Client, StrictConfigType } from 'tdl';
import { TDLib } from 'tdl-tdlib-ffi';
import Fs from 'fs';
import * as TDLTypes from 'tdl/types/tdlib';
import { EventEmitter } from 'events';

export function readClientInfo(path: string | URL): StrictConfigType {
    const clientInfoFile = Fs.readFileSync(path, 'utf8');
    if (!clientInfoFile) throw new Error('Telegram Client config file not exist');
    const clientInfo = JSON.parse(clientInfoFile) as StrictConfigType;
    return clientInfo;
}

export default class TelegramBot extends EventEmitter {
    public client: Client;
    public myChatId: number;
    private constructor(client: Client, myChatId: number) {
        super();
        this.client = client;
        this.myChatId = myChatId;
    }

    public static async init(apiId: number, apiHash: string): Promise<TelegramBot> {
        const client = new Client(new TDLib(), { apiId, apiHash });
        await client.connectAndLogin();
        const myChatId = (await TelegramBot.getMe(client)).id;
        return new TelegramBot(client, myChatId);
    }

    public static async getMe(client: Client): Promise<TDLTypes.User> {
        const me = await client.invoke({ _: 'getMe' });
        return me;
    }

    public async getUserById(id: number): Promise<TDLTypes.User> {
        const res = await this.client.invoke({
            _: 'getUser',
            user_id: id,
        });
        return res;
    }

    public async getRepliedMessage(chatId: number, MessageId: number): Promise<TDLTypes.message> {
        return await this.client.invoke({ _: 'getRepliedMessage', chat_id: chatId, message_id: MessageId });
    }

    public async parseTextEntities(text: string, parseMode: TDLTypes.TextParseMode$Input):
        Promise<TDLTypes.formattedText> {
        const res = await this.client.invoke({
            _: 'parseTextEntities',
            text,
            parse_mode: parseMode,
        });
        return res;
    }

    public async setBio(bio: string): Promise<TDLTypes.ok> {
        return await this.client.invoke({ _: 'setBio', bio });
    }

    public async listen(): Promise<void> {
        const date = Math.floor(Date.now() / 1000);
        this.client.on('update', async (update) => {
            if (update._ === 'updateNewMessage') {
                if (date - update.message.date > 0) return;
                await this.viewMessages(update.message.chat_id, [update.message.id], true);
                if (update.message.content._ !== 'messageText') return;
                const sender = update.message.sender_user_id;
                if (sender === this.myChatId) return;
                const text = update.message.content.text.text;
                const command = text.split(' ')[0];
                const argument = text.split(' ').slice(1);
                if (this.eventNames().indexOf(command) !== -1) {
                    return this.excute(update.message, command, argument);
                }
                else return;
            }
        });
    }

    public async sendMessage(id: number, msg: string): Promise<TDLTypes.message> {
        const formatText = await this.parseTextEntities(msg, { _: "textParseModeMarkdown" });
        const res = await this.client.invoke({
            _: 'sendMessage',
            chat_id: id,
            input_message_content: {
                _: 'inputMessageText',
                text: formatText,
            }
        });
        return res;
    }

    public async viewMessages(chatId: number, messageIds: number[], forceRead: boolean): Promise<TDLTypes.ok> {
        const res = await this.client.invoke({
            _: 'viewMessages',
            chat_id: chatId,
            message_ids: messageIds,
            force_read: forceRead,
        });
        return res;
    }

    public excute(message: TDLTypes.message, command: string, argument: string[]): boolean {
        return this.emit(command, message, argument);
    }
}


