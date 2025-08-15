import { config } from "./config.js";
import { GoogleAuth } from "google-auth-library";

export class GoogleTokenManager {
  private static auth = new GoogleAuth({ keyFile: config.SERVICE_ACCOUNT_PATH });
  private static clientId = config.GOOGLE_CLIENT_ID;
  private static client: any = null;
  private static token: string | null = null;
  private static tokenExp = 0;

  private static async getClient() {
    if (!GoogleTokenManager.client) {
      GoogleTokenManager.client = await GoogleTokenManager.auth.getClient();
    }
    return GoogleTokenManager.client;
  }

  public static async getToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (GoogleTokenManager.token && now < GoogleTokenManager.tokenExp - 60) {
      return GoogleTokenManager.token;
    }
    const client = await GoogleTokenManager.getClient();
    const idToken = await client.fetchIdToken(GoogleTokenManager.clientId);
    const [, payloadB64] = idToken.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
    GoogleTokenManager.token = idToken;
    GoogleTokenManager.tokenExp = payload.exp;
    return idToken;
  }
}

export default GoogleTokenManager;
