import axios from "axios";
import { config } from "./config.js";
import type { Cert } from "./types.js";
import { createLogger } from "./logger/index.js";
import GoogleTokenManager from "./GoogleTokenManager.js";

type UakeyResponse = Cert[];

const logger = createLogger("UakeyClient");

class UakeyClient {
  async fetchUakeyInfo(USREOU: string): Promise<UakeyResponse> {
    const MAX_ATTEMPTS = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < MAX_ATTEMPTS) {
      try {
        const token = await GoogleTokenManager.getToken();
        const optionsFetch = {
          method: "GET",
          url: `${config.CERT_SERVICE}/api/certs/${String(USREOU)}`,
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        const res = await axios.request(optionsFetch);

        if (res.status === 200) {
          return res.data as UakeyResponse;
        } else {
          logger.warn(`Uakey API returned status ${res.status} for USREOU ${USREOU}. Attempt ${attempt + 1}`);
        }
      } catch (err) {
        lastError = err;
        logger.warn(`Attempt ${attempt + 1} failed to fetch Uakey data for USREOU ${USREOU}:`, err);
      }
      attempt++;
    }

    logger.error("❌Error fetch Uakey data after 3 attempts:", lastError);
    throw new Error("Failed to fetch Uakey data after 3 attempts");
  }
}

export default UakeyClient;
