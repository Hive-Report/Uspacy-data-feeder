import axios from "axios";
import { config } from "./config.js";

class UakeyClient {
  async fetchUakeyInfo(USREOU: string) {
    try {
      const optionsFetch = {
        method: "GET",
        url: `${config.PARSER}/api/uakey/${String(USREOU)}`,
        headers: { accept: "application/json", "content-type": "application/json" },
      };
      const res = await axios.request(optionsFetch);

      return res.data;
    } catch (err) {
      console.error("❌Error fetch Uakey data:", err);
      process.exit(1);
    }
  }
}

export default UakeyClient;
