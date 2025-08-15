import axios from "axios";
import { config } from "./config.js";
import type { Cert } from "./types.js";
import { createLogger } from "./logger/index.js";

type UakeyResponse = Cert[];

const logger = createLogger("UakeyClient");

class UakeyClient {
  async fetchUakeyInfo(USREOU: string): Promise<UakeyResponse> {
    try {
      const optionsFetch = {
        method: "GET",
        url: `${config.CERT_SERVICE}/certs/${String(USREOU)}`,
        headers: { accept: "application/json", "content-type": "application/json" },
      };
      const res = await axios.request(optionsFetch);

      return res.data as UakeyResponse;
    } catch (err) {
      logger.error("❌Error fetch Uakey data:", err);
      throw new Error("Failed to fetch Uakey data");
    }
  }
}

export default UakeyClient;
