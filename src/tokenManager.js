const axios = require('axios');

let SESSION_TOKEN = null;

const startTokenLifecycle = async () => {
  try {
    const fetchToken = async () => {
      const optionsFetch = {
        method: 'POST',
        url: `https://${process.env.SPACE}.uspacy.ua/auth/v1/auth/sign_in`,
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        data: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
      };

      const res = await axios.request(optionsFetch);
      SESSION_TOKEN = res.data.refreshToken;
      const expireInSeconds = res.data.expireInSeconds;

      console.log('ℹ️ New token fetched.');
      console.log(`⏳Token will expire in ${expireInSeconds} seconds.`);

      setTimeout(refreshToken, (expireInSeconds - 5) * 1000);
    };

    const refreshToken = async () => {
      try {
        const optionsRefresh = {
          method: 'POST',
          url: `https://${process.env.SPACE}.uspacy.ua/auth/v1/auth/refresh_token`,
          headers: { accept: 'application/json', authorization: `Bearer ${SESSION_TOKEN}` },
        };

        const res = await axios.request(optionsRefresh);
        SESSION_TOKEN = res.data.refreshToken;
        const expireInSeconds = res.data.expireInSeconds;

        console.log('ℹ️ Token refreshed.');
        console.log(`⏳Token will expire in ${expireInSeconds} seconds.`);

        setTimeout(refreshToken, (expireInSeconds - 5) * 1000);
      } catch (err) {
        console.error('❌Error refreshing token:', err);
        console.log('🔁Retrying fetch token...');
        await fetchToken();
      }
    };

    await fetchToken();
  } catch (err) {
    console.error('❌Error starting token lifecycle:', err);
    process.exit(1);
  }
};

const getToken = () => {
  if (!SESSION_TOKEN) {
    throw new Error('❌Token is not initialized yet.');
  }
  return SESSION_TOKEN;
};

module.exports = {
  startTokenLifecycle,
  getToken,
};
