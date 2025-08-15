import { createLogger } from '../logger/index.js';
import type { Flow } from '../types.js';
import type UakeyClient from '../UakeyClient.js';
import type UspaceClient from '../UspaceClient.js';
import { extractUSREOU } from '../utils.js';

const logger = createLogger('initializeCRMWithKEPDataFlow');

class initializeCRMWithKEPDataFlow implements Flow {
    private UspaceClient: UspaceClient;
    private UakeyClient: UakeyClient;

    constructor(UspaceClient: UspaceClient, UakeyClient: UakeyClient) {
        this.UspaceClient = UspaceClient;
        this.UakeyClient = UakeyClient;
    }

    async execute(): Promise<void> {
        try {
            const companyId = await this.UspaceClient.identifyCompany('Тест Тестович'); //debug company name
            const USREOU = await this.UspaceClient.getCompanyUSREOU(companyId);

            const fetchedUakeyCerts = await this.UakeyClient.fetchUakeyInfo(USREOU);
            if (!fetchedUakeyCerts || fetchedUakeyCerts.length === 0) {
                logger.error('KEPS were not found for the company:', companyId);
                throw new Error('KEPS were not found for the company.' + companyId);
            }
        } catch (error) {
            logger.error('Error executing initializeCRMWithKEPDataFlow:', error);
            throw error;
        }
    }
}

export default initializeCRMWithKEPDataFlow;