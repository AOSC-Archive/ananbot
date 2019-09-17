export const OpenissueFail = 'Usege: reply some message: /openissue + issue title';

export function OpenissueSuccessfully(issueNumber: number, url: string): string {
    return `Open issue [#${issueNumber}](${url}) successfully!`;
}

export const CloseIssueFailUsege = 'Usege: /closeissue + number or # + number';

export function closeIssueFailIssueClosed(issueNumber: number): string {
    return `Issue ${issueNumber} has been closed`;
}

export function closeIssueSuccessfully(issueNumber: number, url: string): string {
    return `Open issue [#${issueNumber}](${url}) successfully`
}

export function openissueBody(text: string, author?: string): string {
    if (!author) {
        return '##Description\n\n' +
            `${text}\n\n`;
    }
    else {
        return '## Description\n\n' +
            `${text}\n\n` +
            '## Open issue By \n\n' +
            `${author} from telegram`;
    }
}
export const replyAndCloseIssueFail = 'Usege: /replyandclose + issue number + reply text';
