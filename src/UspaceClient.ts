import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import UspacyTokenManager from "./UspacyTokenManager.js";
import { config } from "./config.js";
import { createLogger } from "./logger/index.js";
import { extractUSREOU } from "./utils.js";
import type { KEPStorageType } from "./types.js";

interface RequestOptions extends AxiosRequestConfig {
  method: string;
  url: string;
  params?: any;
  data?: any;
}

const logger = createLogger("UspaceClient");

class UspaceClient {
  async sendRequest(options: RequestOptions): Promise<AxiosResponse> {
    const token = await UspacyTokenManager.getToken();

    options.headers = {
      ...options.headers,
      accept: "application/json",
      authorization: `Bearer ${token}`,
    };

    if (["POST", "PUT", "PATCH"].includes(options.method?.toUpperCase())) {
      options.headers["Content-Type"] = "application/json";
    }

    try {
      return await axios.request(options);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async search(param: string | number): Promise<any> {
    if (typeof param !== "string") {
      param = String(param);
    }

    const options = {
      method: "GET",
      url: `https://${config.SPACE}.uspacy.ua/search/v1/search`,
      params: {
        q: param,
      },
    };
    const res = await this.sendRequest(options);

    return res.data.data;
  }

  async getFieldTypes() {
    const options = {
      method: "GET",
      url: `https://${config.SPACE}.uspacy.ua/crm/v1/field_types`,
    };
    const res = await this.sendRequest(options);

    return res.data.data;
  }

  async getEntityFields(entity: string | number): Promise<any> {
    if (typeof entity !== "string") {
      entity = String(entity);
    }

    const options = {
      method: "GET",
      url: `https://${config.SPACE}.uspacy.ua/crm/v1/entities/${entity}/fields`,
    };
    const res = await this.sendRequest(options);

    return res.data.data;
  }

  async getEntityFieldByItemCode(entity: string | number, code: string | number): Promise<any> {
    if (typeof entity !== "string") {
      entity = String(entity);
    }
    if (typeof code !== "string") {
      code = String(code);
    }

    const options = {
      method: "GET",
      url: `https://${config.SPACE}.uspacy.ua/crm/v1/entities/${entity}/fields/${code}`,
    };
    const res = await this.sendRequest(options);

    return res.data;
  }

  async getEntity(entity: string | number, itemId: string | number): Promise<any> {
    if (typeof entity !== "string") {
      entity = String(entity);
    }
    if (typeof itemId !== "string") {
      itemId = String(itemId);
    }

    const options = {
      method: "GET",
      url: `https://${config.SPACE}.uspacy.ua/crm/v1/entities/${entity}/${itemId}`,
    };
    const res = await this.sendRequest(options);

    return res.data;
  }

  async editEntityItem(
    entity: string | number,
    itemId: string | number,
    field: string,
    value: any,
  ): Promise<any> {
    if (typeof entity !== "string") {
      entity = String(entity);
    }
    if (typeof field !== "string") {
      field = String(field);
    }
    if (typeof value !== "string") {
      value = String(value);
    }

    const options = {
      method: "PATCH",
      url: `https://${config.SPACE}.uspacy.ua/crm/v1/entities/${entity}/${itemId}`,
      data: { [field]: value },
    };
    const res = await this.sendRequest(options);

    return res.data;
  }

  async getKEPsByCompany(companyId: string | number): Promise<any> {
    if (typeof companyId !== "string") {
      companyId = String(companyId);
    }

    const options = {
      method: "GET",
      url: `https://${config.SPACE}.uspacy.ua/crm/v1/entities/companies/${companyId}/related/keps/`,
    };
    const res = await this.sendRequest(options);

    return res.data.data;
  }

  async deleteKEP(itemId: string | number): Promise<any> {
    const options = {
      method: "DELETE",
      url: `https://${config.SPACE}.uspacy.ua/crm/v1/entities/keps/${itemId}`,
    };
    const res = await this.sendRequest(options);

    return res.data;
  }

  async createKEPEntityForCompany(
    companyId: string | number,
    title: string,
    owner: string | number,
    data_formuvannya: number,
    data_zakinchennya: number,
    tip: string,
    nosiy: KEPStorageType,
  ): Promise<any> {
    if (typeof companyId !== "string") {
      companyId = String(companyId);
    }
    if (typeof title !== "string") {
      title = String(title);
    }
    if (typeof owner !== "string") {
      owner = String(owner);
    }

    const options = {
      method: "POST",
      url: `https://${config.SPACE}.uspacy.ua/crm/v1/entities/keps`,
      data: {
        title,
        owner,
        data_formuvannya,
        data_zakinchennya,
        tip,
        nosiy,
        kompaniya: { id: companyId },
      },
    };
    const res = await this.sendRequest(options);

    return res.data;
  }

  async identifyCompany(companyName: string): Promise<string> {
    const companyId = (await this.search(companyName)).companies[0]?.id;
    if (!companyId) {
      logger.error("Company ID was not found for company:", companyName);
      throw new Error("Company ID was not found for company: " + companyName);
    }
    logger.info(`Company ID found: ${companyId} for company ${companyName}`);
    return companyId;
  }

  async getCompanyUSREOU(companyId: string | number): Promise<string> {
    const USREOU = extractUSREOU((await this.getEntity("companies", companyId)).uf_crm_1632905074);
    if (!USREOU) {
      logger.error("Company USREOU code was not found for company ID:", companyId);
      throw new Error("Company USREOU code was not found for company ID: " + companyId);
    }

    return USREOU;
  }
}

export default UspaceClient;
