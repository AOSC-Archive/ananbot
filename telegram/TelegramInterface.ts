import { StrictConfigType } from 'tdl';
export interface ClientInfo extends StrictConfigType {
    apiId: number;
    apiHash: string;
    tgNumber: string;
}