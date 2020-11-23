exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const msg = await message.channel.send("Downloading JSON...");
    let clanTags = args.map(tag => tag.toUpperCase())

    // if no clans were specified, then grab the tags for all clans with stored tokens
    if (clanTags.length === 0) {
        clanTags = client.tokens.keyArray(0)
    }
    msg.edit(`Downloading json files for ${clanTags}`)

    // download json for each clan
    for (let tag of clanTags) {
        try {
            let clanJsonData = await client.getCBData(tag, message.channel)
            let successMessage = `${tag}: Successfully downloaded ${clanJsonData.alpha.length + clanJsonData.bravo.length} battles`
            client.logger.log(successMessage)
            await message.channel.send(successMessage)

            // // post to google drive
            // let uploadAlphaResponse = await client.gDrive.files.create({
            //     source: clanJsonData.alpha,
            //     parentFolder: '1nm5HPsMp56ZzXUEp303Mn1-3QwjBpRZ0',
            //     name: 'testAlpha.json',
            //     mimeType: 'application/json'
            // });
            // // post to google drive
            // let uploadBravoResponse = await client.gDrive.files.create({
            //     source: clanJsonData.bravo,
            //     parentFolder: '1nm5HPsMp56ZzXUEp303Mn1-3QwjBpRZ0',
            //     name: 'testBravo.json',
            //     mimeType: 'application/json'
            // });
            client.googleDrive
            .useServiceAccountAuth(client.googleCredentials)
            .then((gdrivehandler) => {
              return client.googleDrive.createFolder(
                `195-tSRxwb5OxNMJV-qFW8vk8b5NR2Lh2`,
                `test_folder_${Date.now()}`
              );
            })

        } catch (error) {
            client.logger.log(error, 'warn')
            await message.channel.send(error);
        }
    }

    msg.edit(`Finished, results: `)
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User"
};

exports.help = {
    name: "download",
    category: "JSON",
    description: "Run this command to download clan battles JSON on demand.",
    usage: "download"
};