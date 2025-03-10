import axios from "axios";
import { getToken } from './tokenManager.js';

class UspaceManager {
    async search(params) {
        const token = getToken();
        const res = await axios.request({
            method: 'GET',
            url: `https://${process.env.SPACE}.uspacy.ua/search/v1/search`,
            params: {
                q: params.q,
            },
            headers: {accept: 'application/json', authorization: `Bearer ${token}`}
            }).catch(err => console.error(err));

        return res.data.data.companies[0].id;
    };
};

export default UspaceManager;