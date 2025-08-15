import type { Cert, KEPStorageType } from "../types.js";
import { convertDDMMYYYYToTimestamp } from "../utils.js";

export interface KEPCRMDto {
  title: string;
  owner: number;
  data_formuvannya: number;
  data_zakinchennya: number;
  nosiy: KEPStorageType;
}

export class KEPCertMapper {
  static toCRMDto(cert: Cert): KEPCRMDto {
    return {
      title: cert.name,
      owner: 7,
      data_formuvannya: cert.start_date ? convertDDMMYYYYToTimestamp(cert.start_date) : 0,
      data_zakinchennya: cert.end_date ? convertDDMMYYYYToTimestamp(cert.start_date) : 0,
      nosiy: cert.storage_type as KEPStorageType,
    };
  }
}
