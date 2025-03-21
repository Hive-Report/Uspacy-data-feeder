import axios from "axios";

class UakeyManager {
    async fetchUakeyInfo(USREOU) {
      
      try {
        const optionsFetch = {
          method: 'GET',
          url: `${process.env.PARSER}/api/uakey/${String(USREOU)}`,
          headers: { accept: 'application/json', 'content-type': 'application/json' },
        };
        const res = await axios.request(optionsFetch);

        return res.data;
        } catch (err) {
          console.error('❌Error fetch Uakey data:', err);
          process.exit(1);
        }
    };
};

export default UakeyManager;