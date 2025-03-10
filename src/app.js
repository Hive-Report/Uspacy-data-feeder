require('dotenv').config();
const { default: axios } = require('axios');
const { startTokenLifecycle, getToken } = require('./tokenManager');

(async () => {
  try {
    console.log('Starting application...');
    
    await startTokenLifecycle();
    console.log('ℹ️ Token lifecycle started.');

    const token = getToken();
    console.log('ℹ️ Current token:', token);

    // Other processes
    const res = await axios.request({
      method: 'GET',
      url: `https://${process.env.SPACE}.uspacy.ua/search/v1/search`,
      params: {
        q: 'ТОВ "ЛЕАНДРА"'
      },
      headers: {accept: 'application/json', authorization: `Bearer ${token}`}
    }).catch(err => console.error(err));

    console.log(res.data.data.companies[0].id);
      

  } catch (err) {
    console.error('❌Error in application:', err);
  }
})();
