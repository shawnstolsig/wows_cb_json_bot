module.exports = (client) => {
    const needle = require('needle');

    const getHeaders = (clan) => ({
        cookies: {
            'wsauth_token': getToken(clan)
        },
        headers: {
            'Host': 'clans.worldofwarships.com',
            'Referer': 'https://clans.worldofwarships.com/clans/gateway/wows/profile',
        }
    });

    const getToken = (clan) => {
        let tag = clan.toUpperCase()
        let clanObj = client.tokens.get(tag)
        if (!clanObj) {
            client.logger.log(`Unable to retrieve token for ${tag}`);
            return;
        }
        return clanObj.token
    }

    const getURL = (team) => {
        let teamNumber = 1;
        if (team === 'bravo') teamNumber = 2;
        return `https://clans.worldofwarships.com/api/ladder/battles/?team=${teamNumber}`;
    }

    client.getCBData = (inputTag, guildId) => {
        return new Promise(async (resolve, reject) => {

            // a return object to store alpha + bravo data combined for this clan tag
            let alphaBravoCombined = {};

            // validate that the clan tag can be found in the database
            if (!client.tokens.get(inputTag)) {
                reject(`${inputTag}: Unrecognized clan tag`)
            }
            // with good tag, grab alpha and bravo teams
            else {
                needle('get', getURL('alpha'), null, getHeaders(inputTag))
                    .then(async (response) => {

                        // API will return 'forbidden' if the token is bad
                        if (response.body === 'Forbidden') {
                            let clanObj = client.tokens.get(inputTag)
                            clanObj.isValid = false;
                            client.tokens.set(inputTag, clanObj)
                            reject(`${inputTag}: Bad/expired token`)
                        } else {
                            alphaBravoCombined.alpha = response.body;
                            client.uploadJsonToDrive(client, response.body, {tag: inputTag, team: 'A'}, client.folderId.get(guildId))
                        }

                        // chain promises together so that bravo results are grabbed after alpha
                        return needle('get', getURL('bravo'), null, getHeaders(inputTag))
                    })
                    .then(async (response) => {
                        if (response.body === 'Forbidden') {
                            let clanObj = client.tokens.get(inputTag)
                            clanObj.isValid = false;
                            client.tokens.set(inputTag, clanObj)
                            reject(`${inputTag}: Bad/expired token`)
                        } else {
                            alphaBravoCombined.bravo = response.body;
                            client.uploadJsonToDrive(client, response.body, {tag: inputTag, team: 'B'}, client.folderId.get(guildId))
                        }
                        resolve(alphaBravoCombined);
                    })
                    .catch(async (err) => {
                        reject(`${inputTag}: Issue with API call`)
                    })
            }

        })
    }

    client.getAllClanJsons = async (channel, clanTags = []) => {

        // make sure there is a valid channel for sending status messages
        if(!channel) channel = client.defaultChannel;

        const msg = await channel.send("Downloading JSON...");

        // if no clans were specified, then grab the tags for all clans with stored tokens
        if (clanTags.length === 0) {
            clanTags = client.tokens.keyArray(0)
        }
        msg.edit(`Downloading json files for ${clanTags}`)

        // download json for each clan
        for (let tag of clanTags) {
            let clanJsonData

            // get cb data (files are posted to google drive inside the getCBData function)
            try {
                clanJsonData = await client.getCBData(tag, channel.guild.id)
                let successMessage = `${tag}: Successfully downloaded ${clanJsonData.alpha.length + clanJsonData.bravo.length} battles`
                client.logger.log(successMessage)
                await channel.send(successMessage)
            } catch (error) {
                client.logger.log(error, 'warn')
                await channel.send(error);
            }

            // post cb data to CB Data API
            try {
                await client.postCBData(clanJsonData.alpha)
                await client.postCBData(clanJsonData.bravo)

                let successMessageApi = `${tag}: Successfully posted ${clanJsonData.alpha.length + clanJsonData.bravo.length} battles to API`
                client.logger.log(successMessageApi)
                await channel.send(successMessageApi)
            } catch (error) {
                client.logger.log(error, 'warn')
                await channel.send(error);
            }

        }

        msg.edit(`Finished, results: `)
    }



};

