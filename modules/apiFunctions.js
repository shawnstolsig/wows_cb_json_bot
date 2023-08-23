module.exports = (client) => {
    const needle = require('needle');

    client.postCBData = (cbData) => {
        return needle('post', `${client.config.apiHostname}/resource/battles/`, cbData, { json: true, headers: { 'Authorization': client.config.apiToken } });
    }
};

