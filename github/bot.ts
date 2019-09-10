import Fs from 'fs';
import Axios, { AxiosInstance } from 'axios';
import * as GithubInterface from './GithubInterface';
import axiosRetry from 'axios-retry';

function readLoginInfo(): GithubInterface.LoginRequest {
    const file = Fs.readFileSync('./login.json', 'utf8');
    if (file) return JSON.parse(file) as GithubInterface.LoginRequest;
    else throw new Error('File not exist');
}

class GithubBot {
    private requester: AxiosInstance;
    public constructor(login: GithubInterface.LoginRequest) {
        this.requester = Axios.create({
            baseURL: "https://api.github.com",
            auth: login,
        });
        axiosRetry(this.requester, { retries: 3 });
    }
    public async getInfo(): Promise<GithubInterface.LoginResponse> {
        const res = await this.requester.get('');
        if (res.status === 200 && res.data) return res.data;
        else throw new Error('GET info failed');
    }
    public async getCloseIssue(): Promise<GithubInterface.IssueResponse> {
        const res = await this.requester.get('/repos/eatradish/saki-telebot-api/issues', { 
            params: { state: 'closed' },
        });
        if (res.status === 200 && res.data) return res.data;
        else throw new Error('GET close issue failed');
    }
    public async openNewIssue(issue: GithubInterface.OpenNewIssueRequest) {
        const json = JSON.stringify(issue);
        const res = await this.requester.post('/repos/eatradish/saki-telebot-api/issues', json);
        if (res.status === 201 && res.data) return res.data;
        else throw new Error('POST open new issue failed');
    }
}

const main = async () => {
    const bot = new GithubBot(readLoginInfo());
    //console.log(await bot.getInfo());
    //onsole.log((await bot.getCloseIssue()));
    console.log(await bot.openNewIssue({
        title: "qaq",
        body: "I'm having a problem with this.",
    }));
}

main();



