exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const msg = await message.channel.send("Downloading JSON...");
    let clanTags = args.map(tag => tag.toUpperCase())

    // if no clans were specified, then grab the tags for all clans with stored tokens
    if (clanTags.length === 0) {
        clanTags = client.tokens.keyArray(0)
    }
    msg.edit(`Downloading json files for ${clanTags}`)

    let jwToken = new client.google.auth.JWT(
        client.key.client_email,
        null,
        client.key.private_key,
        ['https://googleapis.com/auth/drive'],
        null
    )
    jwToken.authorize((err) => {
        if (err) console.log(`err: ${err}`);
        else console.log("Google Authentication Successful");
    })

    let folder = `14qshhYQ4v2TNFU4jOOepDjAxdK9hPTj8`
    client.drive.files.list({
        auth: jwToken,
        pageSize: 10,
        fields: `files(id,name)`
    }, (err, res) => {
        if (err) return client.logger.log(`API returned an error: ${err}`, 'warn');
        var files = res.data.files;
        if (files.length) {
            console.log(`Files:`);
            files.map((file) => {
                console.log(`${file.name} (${file.id})`)
            })
        }
    })

    // download json for each clan
    for (let tag of clanTags) {
        try {
            let clanJsonData = await client.getCBData(tag, message.channel)
            let successMessage = `${tag}: Successfully downloaded ${clanJsonData.alpha.length + clanJsonData.bravo.length} battles`
            client.logger.log(successMessage)
            await message.channel.send(successMessage)



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
