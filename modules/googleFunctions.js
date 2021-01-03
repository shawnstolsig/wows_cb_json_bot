module.exports = (client) => {
    client.uploadJsonToDrive = (client, json, {tag, team}, folderId) => {

        if(!folderId){
            client.defaultChannel.send(`No Google Drive folder currently set.  Please use the 'folder set' command.`)
            client.logger.log(`Folder ID not stored, aborting upload.`, 'warn');
        } else {
            // TODO: file naming (clan tags, session id or just date)
            let {year, month, day} = getDateInfo()
            let filename = `${day}-${month}-${year} ${tag}-${team}.json`
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