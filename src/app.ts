import UspaceClient from "./UspaceClient.js";
import UakeyClient from "./UakeyClient.js";
import UspacyTokenManager from "./UspacyTokenManager.js";
import { config } from "./config.js";
import { createLogger } from "./logger/index.js";
import initializeCRMWithKEPDataFlow from "./flows/initializeCRMWithKEPDataFlow.js";

const logger = createLogger("Server");

(async () => {
  try {
    logger.info("Starting application...");

    await UspacyTokenManager.startTokenLifecycle();
    logger.info("ℹ️ Token lifecycle started.");

    // Other processes
    const uakeyClient1 = new UakeyClient();
    const uspacyClient1 = new UspaceClient();

    const initKEPFlow1 = new initializeCRMWithKEPDataFlow(uspacyClient1, uakeyClient1);


    const uakeyClient2 = new UakeyClient();
    const uspacyClient2 = new UspaceClient();

    const initKEPFlow2 = new initializeCRMWithKEPDataFlow(uspacyClient2, uakeyClient2);


    const uakeyClient3 = new UakeyClient();
    const uspacyClient3 = new UspaceClient();

    const initKEPFlow3 = new initializeCRMWithKEPDataFlow(uspacyClient3, uakeyClient3);


    const uakeyClient4 = new UakeyClient();
    const uspacyClient4 = new UspaceClient();

    const initKEPFlow4 = new initializeCRMWithKEPDataFlow(uspacyClient4, uakeyClient4);

    await Promise.all([
      initKEPFlow1.execute(2957, 5781),
      initKEPFlow2.execute(5782, 8605),
      initKEPFlow3.execute(8606, 11429),
      initKEPFlow4.execute(11430, 14253),
    ]);

    logger.info("✅ KEP data initialized successfully.");
  } catch (err) {
    logger.error("❌Error in application:", err);
  }
})();
