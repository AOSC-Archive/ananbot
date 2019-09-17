import TelegramBot, { readClientInfo } from './telegram/bot';
import GithubBot from './github/bot';
import * as TDLTypes from 'tdl/types/tdlib';
import * as StringConst from './utils/StringConst';
import * as Tools from './utils/tools';

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
        if (argument.length === 0) return await telegramBot.sendMessage(message.chat_id, StringConst.OpenissueFail);
        const rep = await telegramBot.getRepliedMessage(message.chat_id, message.id);
        if (rep.content._ !== 'messageText') {
            return telegramBot.sendMessage(message.chat_id, StringConst.OpenissueFail);
        }
        const username = (await telegramBot.getUserById(message.chat_id)).username;
        const res = await githubBot.openNewIssue({
            title: argument.join(' '),
            body: StringConst.openissueBody(rep.content.text.text, username),
        });
        return await telegramBot.sendMessage(message.chat_id, 
            StringConst.OpenissueSuccessfully(res.number, res.html_url));
    });

    telegramBot.on('/closeissue', async (message: TDLTypes.message, argument: string[]) => {
        if (argument.length === 0) {
            return await telegramBot.sendMessage(message.chat_id, StringConst.CloseIssueFailUsege);
        }
        const issueNumberStr = argument[0];
        const issueNumber = Tools.issueToNumber(issueNumberStr);
        if (!issueNumber) {
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
                StringConst.closeIssueSuccessfully(res.number, res.html_url));
        }
    });

    telegramBot.on('/replyandclose', async (message: TDLTypes.message, argument: string[]) => {
        const issueNumber = Tools.issueToNumber(argument[0]);
        const text = argument[1];
        if (!issueNumber) return telegramBot.sendMessage(message.chat_id, StringConst.replyAndCloseIssueFail);
    });

    telegramBot.listen();
}

main();
