import TelegramBot, { readClientInfo } from './telegram/bot';
import GithubBot from './github/bot';
import * as TDLTypes from 'tdl/types/tdlib';
import * as StringConst from './StringConst';

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
            return telegramBot.sendMessage(message.chat_id, StringConst.OpenissueFail);
        }
        const arg = argument.join(' ');
        if (arg.length === 0) return await telegramBot.sendMessage(message.chat_id, StringConst.OpenissueFail);
        const rep = await telegramBot.getRepliedMessage(message.chat_id, message.id);
        if (rep.content._ !== 'messageText') {
            return telegramBot.sendMessage(message.chat_id, StringConst.OpenissueFail);
        }
        const res = await githubBot.openNewIssue({
            title: arg,
            body: rep.content.text.text,
        });
        return await telegramBot.sendMessage(message.chat_id, StringConst.OpenissueSuccessfully(res.number));
    });
    telegramBot.on('/closeissue', async (message: TDLTypes.message, argument: string[]) => {
        if (argument.length === 0) {
            return await telegramBot.sendMessage(message.chat_id, StringConst.CloseIssueFailUsege);
        }
        const arg = argument.join(' ');
        const issueNumberStr = arg;
        const issueNumber = Number(issueNumberStr.replace('#', ''));
        if (issueNumber === NaN) {
            return await telegramBot.sendMessage(message.chat_id, StringConst.CloseIssueFailUsege);
        }
        const issue = await githubBot.getIssueByNumber(issueNumber);
        if (issue.state === 'closed') {
            return await telegramBot.sendMessage(message.chat_id, 
                StringConst.closeIssueFailIssueClosed(issue.number));
        }
        const res = await githubBot.closeIssue(issueNumber);
        if (res.state === 'closed') {
            return await telegramBot.sendMessage(message.chat_id,
                StringConst.closeIssueSuccessfully(res.number));
        }
    });
    telegramBot.listen();
}

main();
