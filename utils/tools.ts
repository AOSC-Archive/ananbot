export function issueToNumber(issueNumber: string): number | undefined {
    let res: number;
    if (Number(issueNumber) !== NaN) return Number(issueNumber);
    if (issueNumber[0] === '#') {
        res = Number(issueNumber.replace('#', ''));
        if (res !== NaN) return res;
    } else {
        if (issueNumber.indexOf('/') !== -1) {
            const list = issueNumber.split('/');
            res = Number(list[list.length - 1]);
            if (res !== NaN) return res;
        }
    }
}