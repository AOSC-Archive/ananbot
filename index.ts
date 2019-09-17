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
        if (message.reply_to_message_id === 0) {
            return telegramBot.sendMessage(message.chat_id, 'Usege: reply some message: /openissue + issue title');
        }
        const arg = argument.join(' ');
        if (arg.length === 0) return await telegramBot.sendMessage(message.chat_id,
            'Usege: /openissue + issue number');
        const rep = await telegramBot.getRepliedMessage(message.chat_id, message.id);
        if (rep.content._ !== 'messageText') {
            return telegramBot.sendMessage(message.chat_id, 'Usege: reply some message: /openissue + issue number');
        }
        const res = await githubBot.openNewIssue({
            title: arg,
            body: rep.content.text.text,
        });
        return await telegramBot.sendMessage(message.chat_id, `Open issue #${res.number} successfully!`);
    });
    telegramBot.on('/closeissue', async (message: TDLTypes.message, argument: string) => {
        const issueNumberStr = argument;
        const issueNumber = Number(issueNumberStr.replace('#', ''));
        if (issueNumber === NaN) {
            return await telegramBot.sendMessage(message.chat_id, 'Usege: /closeissue + issue number');
        }
        const issue = await githubBot.getIssueByNumber(issueNumber);
        if (issue.state === 'closed') {
            return await telegramBot.sendMessage(message.chat_id, `Issue #${issueNumber} already close`);
        }
        const res = await githubBot.closeIssue(issueNumber);
        if (res.state === 'closed') {
            return await telegramBot.sendMessage(message.chat_id, `Close issue #${issueNumber} successfully!`);
        }
    });
    telegramBot.listen();
}

main();
