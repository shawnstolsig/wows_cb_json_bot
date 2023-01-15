module.exports = (client) => {
    client.uploadJsonToDrive = async (client, json, {tag, team}, folderId) => {

        if(!folderId){
            client.defaultChannel.send(`No Google Drive folder currently set.  Please use the 'folder set' command.`)
            client.logger.log(`Folder ID not stored, aborting upload.`, 'warn');
        } else {

            if(json.length === 0){
                client.logger.log('Empty JSON file, aborting upload. ')
                return
            }

            let {year, month, day} = getDateInfo()
            let seasonNumber = json[0].season_number
            let filename = `S${seasonNumber} ${day}-${month}-${year} ${tag}-${team}.json`

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

    }
};

const getDateInfo = () => {
    let date = new Date();
    let year = date.getFullYear();
    let day = date.getDate();
    let month = date.getMonth();
    switch(month){
        case 0:
            month = 'JAN';
            break;
        case 1:
            month = 'FEB';
            break;
        case 2:
            month = 'MAR';
            break;
        case 3:
            month = 'APR';
            break;
        case 4:
            month = 'MAY';
            break;
        case 5:
            month = 'JUN';
            break;
        case 6:
            month = 'JUL';
            break;
        case 7:
            month = 'AUG';
            break;
        case 8:
            month = 'SEP';
            break;
        case 9:
            month = 'OCT';
            break;
        case 10:
            month = 'NOV';
            break;
        case 11:
            month = 'DEC';
            break;
    }
    return {year, day, month}

}


/**
 * Create a folder and prints the folder ID
 * @return{obj} folder Id
 * */
// async function createFolder() {
//     // Get credentials and build service
//     // TODO (developer) - Use appropriate auth mechanism for your app
//
//     const {GoogleAuth} = require('google-auth-library');
//     const {google} = require('googleapis');
//
//     const auth = new GoogleAuth({
//         scopes: 'https://www.googleapis.com/auth/drive',
//     });
//     const service = google.drive({version: 'v3', auth});
//     const fileMetadata = {
//         name: 'Invoices',
//         mimeType: 'application/vnd.google-apps.folder',
//     };
//     try {
//         const file = await service.files.create({
//             resource: fileMetadata,
//             fields: 'id',
//         });
//         console.log('Folder Id:', file.data.id);
//         return file.data.id;
//     } catch (err) {
//         // TODO(developer) - Handle error
//         throw err;
//     }
// }
