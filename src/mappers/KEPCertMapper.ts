import { createLogger } from "../logger/index.js";
import type { Cert, KEPStorageType } from "../types.js";
import { convertDDMMYYYYToTimestamp } from "../utils.js";

const logger = createLogger("KEPCertMapper");

export interface KEPCRMDto {
  title: string;
  owner: number;
  data_formuvannya: number;
  data_zakinchennya: number;
  tip: string;
  nosiy: KEPStorageType;
}

export class KEPCertMapper {
  static toCRMDto(cert: Cert): KEPCRMDto {
    return {
      title: cert.name,
      owner: 7,
      data_formuvannya: cert.start_date ? Date.parse(cert.start_date) / 1000 : 0,
      data_zakinchennya: cert.end_date ? Date.parse(cert.end_date) / 1000 : 0,
      tip: cert.type,
      nosiy: cert.storage_type as KEPStorageType,
    };
  }
}
