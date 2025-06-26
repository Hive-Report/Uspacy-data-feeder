import axios from "axios";

class UakeyManager {
    async fetchUakeyInfo(USREOU) {      
        try {
            const optionsFetch = {
                method: 'GET',
                url: `${process.env.PARSER}/api/uakey/${String(USREOU)}`,
                headers: { 
                    accept: 'application/json', 
                    'content-type': 'application/json' 
                },
            };
            const res = await axios.request(optionsFetch);
            return res.data;
        } catch (err) {
            console.error('❌ Error fetching Uakey data:', err);
            return null;
        }
    }
    async fetchMassiveUakeyInfo(USREOUList) {
        try {
            const optionsFetch = {
                method: 'POST',
                url: `${process.env.PARSER}/api/uakey/`,
                headers: { 
                    accept: 'application/json', 
                    'content-type': 'application/json' 
                },
                data: {
                    usreou_list: Array.isArray(USREOUList) ? USREOUList : [String(USREOUList)]
                }
            };
            
            console.log('ℹ️ Fetching massive Uakey data for USREOUList:', JSON.stringify(optionsFetch, null, 2));
            const res = await axios.request(optionsFetch);
            return res.data;
        } catch (err) {
            console.error('❌ Error fetching massive Uakey data:', err);
            return null;
        }
    }
}

export default UakeyManager;