const fs = require('fs')

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    if (message.channel.type === 'dm') {
        message.channel.send(`This command doesn't work as a DM...please try again from your Discord server.`);
        return;
    }
    client.getAllClanJsons(message.channel, args.map(tag => tag.toUpperCase()))
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
    description: "Run this command to download clan battles JSON on demand.  If you want to specify only certain clans to download, list them after 'download' separated by a space, ie: 'download ksd ksc'. ",
    usage: "download  ~or~  download tag1 tag2"
};