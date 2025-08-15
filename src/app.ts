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
    const parser = new UakeyClient();
    const uspacy = new UspaceClient();

    const initKEPFlow = new initializeCRMWithKEPDataFlow(uspacy, parser);
    await initKEPFlow.execute();

    logger.info("✅ Application initialized successfully.");
  } catch (err) {
    logger.error("❌Error in application:", err);
  }
})();
