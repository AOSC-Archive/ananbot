import Fs from 'fs';
import Axios, { AxiosInstance } from 'axios';
import * as GithubInterface from './GithubInterface';
import axiosRetry from 'axios-retry';

export function readLoginInfo(path = './login.json'): GithubInterface.LoginRequest {
    const file = Fs.readFileSync(path, 'utf8');
    if (file) return JSON.parse(file) as GithubInterface.LoginRequest;
    else throw new Error('File not exist');
}

export class GithubBot {
    private requester: AxiosInstance;
    private owner: string;
    private repo: string;
    private issueURL: string;
    public constructor(login: GithubInterface.LoginRequest, owner: string, repo: string) {
        this.requester = Axios.create({
            baseURL: "https://api.github.com",
            auth: login,
        });
        this.owner = owner;
        this.repo = repo;
        this.issueURL = `/repos/${owner}/${repo}/issues`;
        axiosRetry(this.requester, { retries: 3 });
    }
    public async getInfo(): Promise<GithubInterface.LoginResponse> {
        const res = await this.requester.get('');
        if (res.status === 200 && res.data) return res.data;
        else throw new Error('GET info failed');
    }
    public async getCloseIssue(): Promise<GithubInterface.IssueResponse> {
        const res = await this.requester.get(this.issueURL, { 
            params: { state: 'closed' },
        });
        if (res.status === 200 && res.data) return res.data;
        else throw new Error('GET close issue failed');
    }
    public async openNewIssue(issue: GithubInterface.OpenNewIssueRequest): Promise<GithubInterface.IssueResponse> {
        const json = JSON.stringify(issue);
        const res = await this.requester.post(this.issueURL, json);
        if (res.status === 201 && res.data) return res.data;
        else throw new Error('POST open new issue failed');
    }
    public async closeIssue(issueNumber: number): Promise<GithubInterface.IssueResponse> {
        const patch = { state: 'closed' };
        const json = JSON.stringify(patch);
        const res = await this.requester.patch(`${this.issueURL}/${issueNumber}`, json);
        if (res.status === 200 && res.data) return res.data;
        else throw new Error(`PATCH close ${issueNumber} failed`);
    }
}

const createGithubBot = (): GithubBot => {
    return new GithubBot(readLoginInfo(), 'aosc-dev', 'aosc-os-abbs');
}

export default createGithubBot;


