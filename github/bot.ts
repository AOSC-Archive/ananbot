import Fs from 'fs';
import Axios, { AxiosInstance } from 'axios';
import * as GithubInterface from './GithubInterface';
import axiosRetry from 'axios-retry';
import * as StringConst from '../utils/StringConst';

export function readSettings(path = './github.json'): GithubInterface.Config {
    const file = Fs.readFileSync(path, 'utf8');
    if (file) return JSON.parse(file) as GithubInterface.Config;
    else throw new Error('File not exist');
}

export class GithubBot {
    private requester: AxiosInstance;
    public owner: string;
    public repo: string;
    public repoURL: string;
    public repoHtmlUrl = `https//github.com/${this.owner}/${this.repo}`;
    public issueURL = `${this.repoURL}/issues`;
    public issueHtmlUrl = `${this.repoHtmlUrl}/issues`;
    public labelList: string[];

    private constructor(obj: GithubInterface.OpenNewGithubBot) {
        this.requester = obj.requester;
        this.owner = obj.owner;
        this.repo = obj.repo;
        this.repoURL = obj.repoURL;
        this.labelList = obj.labelList;
        this.issueURL = `${this.repoURL}/issues`;
        axiosRetry(this.requester, { retries: 3 });
    }

    public static async createGithubBot(config: GithubInterface.Config): Promise<GithubBot> {
        const requester = Axios.create({
            baseURL: "https://api.github.com",
            auth: {
                username: config.username,
                password: config.password
            }
        });
        const owner = config.owner;
        const repo = config.repo;
        const repoURL = `/repos/${owner}/${repo}`;
        const labelList = await GithubBot.getRepoLabels(requester, repoURL);
        const obj = {
            requester, owner, repo, repoURL, labelList
        }
        return new GithubBot(obj);
    }

    public static async getRepoLabels(requester: AxiosInstance, repoURL: string): Promise<string[]> {
        const res = [];
        const resp = await requester.get(`${repoURL}/labels`);
        if (resp.status !== 200 || resp.data === undefined) throw new Error('GET labels failed');
        const list = resp.data as GithubInterface.IssueLabel[];
        for (const index of list) {
            res.push(index.name);
        }
        return res;
    }

    public static getLabelListByIssue(issue: GithubInterface.IssueResponse): string[] {
        const res: string[] = [];
        const list = issue.label as GithubInterface.IssueLabel[];
        for (const index of list) {
            res.push(index.name);
        }
        return res;
    }

    public static getIssueNumber(issue: GithubInterface.IssueResponse): number {
        return issue.number;
    }

    public async getInfo(): Promise<GithubInterface.LoginResponse> {
        const res = await this.requester.get('');
        if (res.status === 200 && res.data) return res.data;
        else throw new Error('GET info failed');
    }

    public async getIssueByNumber(issueNumber: number): Promise<GithubInterface.IssueResponse> {
        const resp = await this.requester.get(`${this.issueURL}/${issueNumber}`);
        if (resp.status === 200 && resp.data) return resp.data;
        else throw new Error(`GET issue ${issueNumber} failed`);
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

    public async checkAndCloseIssue(issueNumber: number): Promise<GithubInterface.IssueResponse> {
        const issue = await this.getIssueByNumber(issueNumber);
        if (issue.state === 'closed') throw new Error(StringConst.issueAlreadyClosed(issueNumber, 
            `${this.issueHtmlUrl}/${issueNumber}`));
        return await this.closeIssue(issueNumber);
    }

    public async addLabelByIssue(issueNumber: number, label: string): Promise<GithubInterface.IssueResponse> {
        if (this.labelList.indexOf(label) === -1) throw new Error('label not exist');
        const issue = await this.getIssueByNumber(issueNumber);
        const issueLabelList = GithubBot.getLabelListByIssue(issue);
        if (issueLabelList.indexOf(label) === -1) issueLabelList.push(label);
        else throw new Error('label exist');
        const json = JSON.stringify({ labels: issueLabelList });
        const resp = await this.requester.patch(this.issueURL, json);
        if (resp.status === 200 && resp.data) return resp.data;
        else throw new Error('PATCH addIabelByIssue failed');
    }

    public async createNewIssueComment(issueNumber: number, text: string): Promise<GithubInterface.IssueResponse> {
        const resp = await this.requester.post(`${this.issueURL}/${issueNumber}/comments`, JSON.stringify({
            body: text,
        }));
        if (resp.status === 200 && resp.data) return resp.data;
        else throw new Error('POST createNewIssueComment failed');
    }
}

const create = async (): Promise<GithubBot> => {
    return await GithubBot.createGithubBot(readSettings());
}

export default create;
