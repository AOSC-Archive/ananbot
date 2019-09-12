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
    teleramBot.on(/^\/openissue (.+)$/, async (msg: Messages.default, props: string[]) => {
        if (!msg.obj.reply_to_message || !msg.obj.message || !msg.obj.message.text) return;
        const title = props[1];
        const body = msg.obj.message.text;
        const issue = { title, body };
        const res = await githubBot.openNewIssue(issue);
        if (res) msg.replyText(`Open issue success, issue number: ${res.number}`);
    });

    teleramBot.on(/^\/closeissue (.+)$/, async (msg: Messages.default, props: string[]) => {
        let issue: number = -1;
        if (Number(props[1]) !== NaN) {
            issue = Number(props[1])
        }
        else if (props[1].indexOf('github.com') !== -1) {
            const parseList = props[1].split('/');
            if (Number(parseList[parseList.length - 1]) !== NaN) issue = Number(parseList[parseList.length - 1]);
        }
        else if (props[1][0] === '#') {
            const toNumber = props[1].replace('#', '');
            if (Number(toNumber) !== NaN) issue = Number(toNumber);
        }
        if (issue === -1) throw new Error('arg Error');
        const res = await githubBot.closeIssue(issue);
        if (res) msg.replyText(`Close issue success, issue number: ${res.number}`);
    });
    
    teleramBot.listen();
}

main();
