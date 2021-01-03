module.exports = (client) => {
    client.uploadJsonToDrive = (client, json, team, folderId) => {

        if(!folderId){
            client.defaultChannel.send(`No Google Drive folder currently set.  Please use the 'folder set' command.`)
            client.logger.log(`Folder ID not stored, aborting upload.`, 'warn');
        } else {
            // TODO: file naming (clan tags, session id or just date)
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

    }
};
