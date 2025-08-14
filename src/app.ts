import UspaceClient from "./UspaceClient.js";
import UakeyClient from "./UakeyClient.js";
import { startTokenLifecycle } from "./UspacyTokenManager.js";
import { config } from "./config.js";

// Types
interface Certificate {
  name: string;
  certType: string;
  startDate: string;
  endDate: string;
  cloudkey: boolean;
}

function extractUSREOU(html: string): string | null {
  const match = html.match(/\b\d{8,}\b/);

  if (match) {
    return match[0];
  }
  console.error("Error: Unable to find correct EDRPOU.");
  return null;
}

function convertDDMMYYYYToTimestamp(dateStr: string): number {
  const [day, month, year] = dateStr.split(".").map(Number);

  if (!day || !month || !year) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const date = new Date(year, month - 1, day);

  return Math.floor(date.getTime() / 1000);
}

(async () => {
  try {
    console.log("Starting application...");

    await startTokenLifecycle();
    console.log("ℹ️ Token lifecycle started.");

    // Other processes
    const parser = new UakeyClient();
    const uspacy = new UspaceClient();

    // I try to find company ID and update all KEPs linked with the company
    let USREOU = "";
    let companyId = "";

    // const testCompanyName = "АСК \"УКРРІЧФЛОТ\"";
    const testCompanyName = "Тест Тестович";

    companyId = (await uspacy.search(testCompanyName)).companies[0].id;
    if (!companyId) {
      throw new Error("Company ID was not found!");
    }

    let KEPsInUspacy = await uspacy.getKEPsByCompany(companyId);
    console.log(`Before deleting: ${KEPsInUspacy}`);

    for (const KEP of KEPsInUspacy) {
      await uspacy.deleteKEP(KEP.id);
    }

    KEPsInUspacy = await uspacy.getKEPsByCompany(companyId);
    console.log(`After deleting: ${KEPsInUspacy}`);

    const extractedUSREOU = extractUSREOU(
      (await uspacy.getEntity("companies", companyId)).uf_crm_1632905074,
    );
    if (!extractedUSREOU) {
      throw new Error("Company USREOU code was not found!");
    }
    USREOU = extractedUSREOU;
    console.log(`USREOU: ${USREOU}`);

    const paresdCerts = await parser.fetchUakeyInfo(USREOU);
    if (!paresdCerts) {
      throw new Error("Uakey parsing failed.");
    }
    if (paresdCerts.uakey[USREOU].certs.length === 0) {
      throw new Error("KEPS was not found.");
    }
    const certsArray: Certificate[] = paresdCerts.uakey[USREOU].certs || [];
    const signingCerts = certsArray.filter((cert: Certificate) => cert.certType === "Підписання");
    console.log(signingCerts);

    for (const cert of signingCerts) {
      await uspacy.createKEPEntityForCompany(
        companyId,
        cert.name,
        7,
        convertDDMMYYYYToTimestamp(cert.startDate),
        convertDDMMYYYYToTimestamp(cert.endDate),
        cert.cloudkey,
      );
    }

    KEPsInUspacy = await uspacy.getKEPsByCompany(companyId);
    console.log(`Result: ${KEPsInUspacy}`);
  } catch (err) {
    console.error("❌Error in application:", err);
  }
})();
