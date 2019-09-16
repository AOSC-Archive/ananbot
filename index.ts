import TelegramBot, { readClientInfo } from './telegram/bot';
import GithubBot from './github/bot';
import * as TDLTypes from 'tdl/types/tdlib';

const createTelegramBot = async (): Promise<TelegramBot> => {
    const info = readClientInfo('./telegram.json');
    const telegramBot = await TelegramBot.init(info.apiId, info.apiHash);
    return telegramBot;
}

const main = async (): Promise<void> => {
    const githubBot = await GithubBot();
    const telegramBot = await createTelegramBot();
    telegramBot.on('/hello', (message: TDLTypes.message) => telegramBot.sendMessage(message.chat_id, 'Hello!'));
    telegramBot.on('/openissue', async (message: TDLTypes.message, argument: string[]) => {
        if (message.reply_to_message_id !== 0 && argument.length !== 0) {
            const rep = await telegramBot.getRepliedMessage(message.chat_id, message.id);
            if (rep.content._ !== 'messageText') return;
            const res = await githubBot.openNewIssue({
                title: argument[0],
                body: rep.content.text.text,
            });
            telegramBot.sendMessage(message.chat_id, `Open issue #${res.number} success!`);
        }
    });
    telegramBot.on('/closeissue', async (message: TDLTypes.message, argument: string[]) => {
        const issueNumberStr = argument[0];
        const issueNumber = Number(issueNumberStr.replace('#', ''));
        if (issueNumber !== NaN) {
            const res = await githubBot.closeIssue(issueNumber);
            if (res.state === 'closed') {
               return await telegramBot.sendMessage(message.chat_id, `Close issue #${issueNumber} success!`);
            }
        }
    });
    telegramBot.listen();
}

main();
