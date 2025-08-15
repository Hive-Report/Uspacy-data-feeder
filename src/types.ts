export interface Flow {}

export type Cert = {
    serial?: string;
    name: string;
    start_date: string;
    end_date: string;
    type?: string;
    storage_type?: string;
    crypt?: string;
    status?: string;
}