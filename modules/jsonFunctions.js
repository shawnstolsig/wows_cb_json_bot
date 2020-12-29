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

    // TODO: connect this function (or a similiar one) to the cron.  will want to mention aussie if bad token detected.

    const getCBData = (inputTag) => {
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
                            reject(`${inputTag}: Bad/expired token`)
                        } else {
                            alphaBravoCombined.alpha = response.body;
                            uploadJsonToDrive(client, response.body, 'A')
                        }

                        // chain promises together so that bravo results are grabbed after alpha
                        return needle('get', getURL('bravo'), null, getHeaders(inputTag))
                    })
                    .then(async (response) => {
                        if (response.body === 'Forbidden') {
                            reject(`${inputTag}: Bad/expired token`)
                        } else {
                            alphaBravoCombined.bravo = response.body;
                            uploadJsonToDrive(client, response.body, 'B')
                        }
                        resolve(alphaBravoCombined);
                    })
                    .catch(async (err) => {
                        reject(`${inputTag}: Issue with API call`)
                    })
            }

        })
    }

    client.getCBData = getCBData


};

// TODO: file naming (clan tags, session id or just date)
// TODO: code organization...move this to googleFunctions.js?
const uploadJsonToDrive = (client, json, team) => {


    let folderId = '1nm5HPsMp56ZzXUEp303Mn1-3QwjBpRZ0';   // 'season test' folder
    let filename = `test${team}.json`
    let fileMetadata = {
        'name': filename,
        parents: [folderId],
    };
    let media = {
        mimeType: 'application/json',
        body: JSON.stringify(json)
    };
    client.drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id'
    }, function (err, file) {
        if (err) {
            // Handle error
            client.logger.log(`Failed to upload JSON. ${err}`);
        } else {
            client.logger.log(`Successfully wrote ${filename} to Google Drive.  File id: ${file.id}`);
        }
    });
}