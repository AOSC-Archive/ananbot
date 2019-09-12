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
    public owner: string;
    public repo: string;
    private repoURL: string;
    private issueURL: string;
    public labelList: string[];
    private constructor(obj: GithubInterface.OpenNewGithubBot) {
        this.requester = obj.requester;
        this.owner = obj.owner;
        this.repo = obj.repo;
        this.repoURL = obj.repoURL;
        this.labelList = obj.labelList;
        this.issueURL = `${this.repoURL}/issues`;
    }
    public static async createGithubBot(login: GithubInterface.LoginRequest, owner: string, repo: string): 
    Promise<GithubBot> {
        const requester = Axios.create({
            baseURL: "https://api.github.com",
            auth: login,
        });
        const repoURL = `/repos/${owner}/${repo}`;
        const labelList = await GithubBot.getRepoLabels(requester, repoURL);
        const obj = {
            requester, owner, repo, repoURL, labelList
        }
        return new GithubBot(obj);
    }
    public static async getRepoLabels(requester: AxiosInstance, repoURL: string): Promise<string[]> {
        const res: string[] = [];
        requester.get(`${repoURL}/labels`).catch((err) => console.log(err));
        const resp = await requester.get(`${repoURL}/labels`);
        if (resp.status !== 200 || resp.data === undefined) throw new Error('GET labels failed');
        const list = resp.data as GithubInterface.IssueLabel[];
        for (const index of list) {
            res.push(index.name);
        }
        return res;
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
    public getIssueNUmber(issue: GithubInterface.IssueResponse) {
        return issue.number;
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

const create = async (): Promise<GithubBot> => {
    return await GithubBot.createGithubBot(readLoginInfo(), 'eatradish', 'saki-telebot-api');
}

export default create;


