export const OpenissueFail = 'Usege: reply some message: /openissue + issue title';

export function OpenissueSuccessfully(issueNumber: number): string {
    return `Open issue #${issueNumber} successfully!`;
}

export const CloseIssueFailUsege = 'Usege: /closeissue + number or # + number';

export function closeIssueFailIssueClosed(issueNumber: number): string {
    return `Issue ${issueNumber} has been closed`;
}

export function closeIssueSuccessfully(issueNumber: number): string {
    return `Open issue #${issueNumber} successfully`
}
