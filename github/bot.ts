import Fs from 'fs';
import Axios, { AxiosInstance } from 'axios';
import * as GithubInterface from './GithubInterface';
import axiosRetry from 'axios-retry';

function readLoginInfo(): GithubInterface.LoginRequest | undefined {
    const file = Fs.readFileSync('./login.json', 'utf8');
    if (file) return JSON.parse(file) as GithubInterface.LoginRequest;
    else throw new Error('File not exist');
}

class GithubBot {
    private requester: AxiosInstance;
    private auth: GithubInterface.LoginRequest;
    public constructor(login: GithubInterface.LoginRequest) {
        this.requester = Axios.create({
            baseURL: "https://api.github.com",
        });
        this.auth = login;
        axiosRetry(this.requester, { retries: 3 });
    }
    public async login() {
        const res = await this.requester.get('/', { auth: this.auth });
        if (res.status === 200) console.log(res.data);
        else throw new Error('login failed');
    }
    public async getInfo() {
        const res = await this.requester.get('');
        if (res.status === 200) console.log(res.data);
    }
    public async getCloseIssue() {
        const res = await this.requester.get('/repos/aosc-dev/aosc-os-abbs/issues', { 
            params: { state: 'closed' },
        });
        if (res.status === 200) console.log(res.data);
    }
}
const login = readLoginInfo();
if (login) {
    const bot = new GithubBot(login);
    bot.login();
    bot.getCloseIssue();
}


