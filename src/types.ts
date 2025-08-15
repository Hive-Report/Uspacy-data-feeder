export interface Flow {}

export interface Cert {
  serial?: string;
  name: string;
  start_date: string;
  end_date: string;
  type: string;
  storage_type?: KEPStorageType;
  crypt?: string;
  status?: string;
}

export type KEPStorageType = "Файловий" | "Токен" | "CloudKey";
