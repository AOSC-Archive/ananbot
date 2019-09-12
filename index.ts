import TelegramBot from './telegram/api/bot';
import * as Messages from './telegram/api/message';
import GithubBot from './github/bot';
import Fs from 'fs';

const createTelegramBot = (): TelegramBot => {
    let token;
    const telegramBotTokenFile = Fs.readFileSync('./telegram_token.json', 'utf8');
    const telegramBotTokenFileJson = JSON.parse(telegramBotTokenFile);
    if (telegramBotTokenFileJson && telegramBotTokenFileJson.token) token = telegramBotTokenFileJson.token;
    const telegramBot = new TelegramBot(token);
    return telegramBot;
}

const main = async () => {
    const githubBot = await GithubBot();
    const teleramBot = createTelegramBot();

    teleramBot.on('/hello', (msg: Messages.default) => msg.replyText('Hello'));
    teleramBot.on(/^\/openissue (.+)$/, (msg: Messages.default, props: string[]) => {
        if (!msg.obj.reply_to_message || !msg.obj.message || !msg.obj.message.text) return;
        const title = props[1];
        const body = msg.obj.message.text;
        const issue = { title, body };
        githubBot.openNewIssue(issue);
    });
    teleramBot.listen();
}

main();
