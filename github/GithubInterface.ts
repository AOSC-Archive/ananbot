export interface LoginRequest {
    username: string;
    password: string;
}

export interface IssueResponse {
    url: string;
    repository_url: string;
    comments_url: string;
    events_url: string;
    html_url: string;
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: User;
    label: IssueLabel[];
    state: string;
    locked: boolean;
    assignee: User;
    assignees: User[];
    milestone: {};
    comments: number;
    created_at: string;
    updated_at?: string;
    closed_at?: string;
    author_association: string;
    body: string;
}

export interface User {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
}

export interface IssueLabel {
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
}

export interface LoginResponse {
    current_user_url: 'https://api.github.com/user';
    current_user_authorizations_html_url: 'https://github.com/settings/connections/applications{/client_id}';
    authorizations_url: 'https://api.github.com/authorizations';
    code_search_url: 'https://api.github.com/search/code?q={query}{&page;per_page;sort;order}';
    commit_search_url: 'https://api.github.com/search/commits?q={query}{&page;per_page;sort;order}';
    emails_url: 'https://api.github.com/user/emails';
    emojis_url: 'https://api.github.com/emojis';
    events_url: 'https://api.github.com/events';
    feeds_url: 'https://api.github.com/feeds';
    followers_url: 'https://api.github.com/user/followers';
    following_url: 'https://api.github.com/user/following{/target}';
    gists_url: 'https://api.github.com/gists{/gist_id}';
    hub_url: 'https://api.github.com/hub';
    issue_search_url: 'https://api.github.com/search/issues?q={query}{&page;per_page;sort;order}';
    issues_url: 'https://api.github.com/issues';
    keys_url: 'https://api.github.com/user/keys';
    notifications_url: 'https://api.github.com/notifications';
    organization_repositories_url: 'https://api.github.com/orgs/{org}/repos{?type;page;per_page;sort}';
    organization_url: 'https://api.github.com/orgs/{org}';
    public_gists_url: 'https://api.github.com/gists/public';
    rate_limit_url: 'https://api.github.com/rate_limit';
    repository_url: 'https://api.github.com/repos/{owner}/{repo}';
    repository_search_url: 'https://api.github.com/search/repositories?q={query}{&page;per_page;sort;order}';
    current_user_repositories_url: 'https://api.github.com/user/repos{?type;page;per_page;sort}';
    starred_url: 'https://api.github.com/user/starred{/owner}{/repo}';
    starred_gists_url: 'https://api.github.com/gists/starred';
    team_url: 'https://api.github.com/teams';
    user_url: 'https://api.github.com/users/{user}';
    user_organizations_url: 'https://api.github.com/user/orgs';
    user_repositories_url: 'https://api.github.com/users/{user}/repos{?type;page;per_page;sort}';
    user_search_url: 'https://api.github.com/search/users?q={query}{&page;per_page;sort;order}';
}

export interface OpenNewIssueRequest {
    title: string;
    body: string;
    assignee?: string;
    milestone?: number;
    labels?: string[];
    assignees?: string[];
}