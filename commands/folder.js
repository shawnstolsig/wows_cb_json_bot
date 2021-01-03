exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const msg = await message.channel.send("Folder command initiated...");
    const [action, folderId] = args

    // commands shouldn't work if not a DM, because we need access to a guild ID
    if(message.channel.type === 'dm'){
        msg.edit(`This command does not work as a DM...please try again from your Discord server.`)
    }

    // for setting folder
    else if (action === 'set') {
        if (!folderId) msg.edit(`Please provide folder's ID when using set command. `);
        else {
            client.folderId.set(message.guild.id, folderId)
            msg.edit(`${message.guild.name}'s Google Drive folder set to ${folderId}`);
        };
    }

    // for clearing all folders
    else if (action === 'clear') {
        if (message.author.permLevel !== 10) {
            msg.edit(`Only the bot owner can run this command.`)
            return;
        }

        client.folderId.clear()
        msg.edit(`All folder IDs cleared.`)
    }

    // return the current google driver folder
    else {
        msg.edit(`${message.guild.name}'s current Google Drive folder ID: ${client.folderId.get(message.guild.id)}`)
    }

};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User"
};

exports.help = {
    name: "folder",
    category: "JSON",
    description: "This command is used to specify which Google drive folder to save JSON to.  Use folder's ID (from it's Google Drive URL).  Should be updated each season.",
    usage: "folder"
};