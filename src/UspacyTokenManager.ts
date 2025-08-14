import axios from "axios";
import type { TokenManager } from "./types.js";
import { config } from "./config.js";

class UspacyTokenManager implements TokenManager {
  private static SESSION_TOKEN: string | null = null;

  static async startTokenLifecycle(): Promise<void> {
    try {
      const fetchToken = async () => {
        const optionsFetch = {
          method: "POST",
          url: `https://${config.SPACE}.uspacy.ua/auth/v1/auth/sign_in`,
          headers: { accept: "application/json", "content-type": "application/json" },
          data: { email: config.ADMIN_EMAIL, password: config.ADMIN_PASSWORD },
        };

        const res = await axios.request(optionsFetch);
        UspacyTokenManager.SESSION_TOKEN = res.data.refreshToken;
        const expireInSeconds = res.data.expireInSeconds;

        console.log("ℹ️ New token fetched.");
        console.log(`⏳Token will expire in ${expireInSeconds} seconds.`);

        setTimeout(refreshToken, (expireInSeconds - 5) * 1000);
      };

      const refreshToken = async () => {
        try {
          const optionsRefresh = {
            method: "POST",
            url: `https://${config.SPACE}.uspacy.ua/auth/v1/auth/refresh_token`,
            headers: { accept: "application/json", authorization: `Bearer ${UspacyTokenManager.SESSION_TOKEN}` },
          };

          const res = await axios.request(optionsRefresh);
          UspacyTokenManager.SESSION_TOKEN = res.data.refreshToken;
          const expireInSeconds = res.data.expireInSeconds;

          console.log("ℹ️ Token refreshed.");
          console.log(`⏳Token will expire in ${expireInSeconds} seconds.`);

          setTimeout(refreshToken, (expireInSeconds - 5) * 1000);
        } catch (err) {
          console.error("❌Error refreshing token:", err);
          console.log("🔁Retrying fetch token...");
          await fetchToken();
        }
      };

      await fetchToken();
    } catch (err) {
      console.error("❌Error starting token lifecycle:", err);
      process.exit(1);
    }
  };

  static getToken(): string {
    if (!UspacyTokenManager.SESSION_TOKEN) {
      throw new Error("❌Token is not initialized yet.");
    }
    return UspacyTokenManager.SESSION_TOKEN;
  }
}

export default UspacyTokenManager;
