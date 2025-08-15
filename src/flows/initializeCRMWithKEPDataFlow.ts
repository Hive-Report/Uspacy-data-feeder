import { createLogger } from "../logger/index.js";
import type { Flow, Cert, KEPStorageType } from "../types.js";
import type UakeyClient from "../UakeyClient.js";
import type UspaceClient from "../UspaceClient.js";
import { KEPCertMapper } from "../mappers/KEPCertMapper.js";

const logger = createLogger("initializeCRMWithKEPDataFlow");

class initializeCRMWithKEPDataFlow implements Flow {
  private UspaceClient: UspaceClient;
  private UakeyClient: UakeyClient;

  constructor(UspaceClient: UspaceClient, UakeyClient: UakeyClient) {
    this.UspaceClient = UspaceClient;
    this.UakeyClient = UakeyClient;
  }

  async execute(): Promise<void> {
    try {
      const companyId = await this.UspaceClient.identifyCompany("Тест Тестович");
      const USREOU = await this.UspaceClient.getCompanyUSREOU(companyId);

      const fetchedUakeyCerts: Cert[] = await this.UakeyClient.fetchUakeyInfo(USREOU);
      const signingCerts: Cert[] = fetchedUakeyCerts.filter(
        (cert) => cert.type && cert.type === "Підписання",
      );

      const crmKEPs = await this.UspaceClient.getKEPsByCompany(companyId);

      const uakeyDtos = signingCerts.map((cert) => KEPCertMapper.toCRMDto(cert));
      
      const crmDtos = crmKEPs.map((kep: any) => ({
        title: kep.title,
        owner: kep.owner,
        data_formuvannya: kep.data_formuvannya,
        data_zakinchennya: kep.data_zakinchennya,
        nosiy: kep.nosiy,
      }));

      const areDifferent = (a: typeof uakeyDtos, b: typeof crmDtos): boolean => {
        if (a.length !== b.length) {
          return true;
        }
        const sortFn = (x: (typeof a)[0]) =>
          `${x.title}|${x.owner}|${x.data_formuvannya}|${x.data_zakinchennya}|${x.nosiy}`;
        const aSorted = a.map(sortFn).sort();
        const bSorted = b.map(sortFn).sort();
        return JSON.stringify(aSorted) !== JSON.stringify(bSorted);
      };

      if (areDifferent(uakeyDtos, crmDtos)) {
        for (const kep of crmKEPs) {
          await this.UspaceClient.deleteKEP(kep.id);
        }
        for (const dto of uakeyDtos) {
          await this.UspaceClient.createKEPEntityForCompany(
            companyId,
            dto.title,
            dto.owner,
            dto.data_formuvannya,
            dto.data_zakinchennya,
            dto.nosiy,
          );
        }
        logger.info("CRM KEPs updated for company:", companyId);
        const KEPsInUspacy = await this.UspaceClient.getKEPsByCompany(companyId);
        logger.debug(`Result: ${KEPsInUspacy}`);
      } else {
        logger.info("CRM KEPs are up-to-date for company:", companyId);
      }
    } catch (error) {
      logger.error("Error executing initializeCRMWithKEPDataFlow:", error);
      throw error;
    }
  }
}

export default initializeCRMWithKEPDataFlow;
