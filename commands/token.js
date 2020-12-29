exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const msg = await message.channel.send("Token command initiated...");
    const [action, tag, token] = args

    // for setting token
    if (action === 'set') {
        if (message.channel.type !== 'dm') {
            msg.edit(`This command only works as a DM to me.`);
            return;
        };

        if (!tag || !token) msg.edit(`Please provide both clan tag and token when setting. `);
        else {
            const upperCaseTag = tag.toUpperCase()
            client.tokens.set(upperCaseTag, {
                token, 
                dateSet: new Date()
            })
            msg.edit(`${upperCaseTag}'s token set to ${token}`);
        };
    }

    // for setting token
    else if (action === 'get') {

        // TODO: Create a command that will return how many days are remaining on current tokens, assuming they are valid for 14 days

        if (message.author.permLevel !== 10) {
            msg.edit(`Only the bot owner can run this command.`)
            return;
        }

        if (message.channel.type !== 'dm') {
            msg.edit(`This command only works as a DM to me.`);
            return;
        };

        if (!tag) {
            let message = `All stored tokens:`
            let keys = client.tokens.keyArray()
            keys.map(key => {
                let clanObj = client.tokens.get(key);
                message += `\n${key}: ${clanObj.token} (${clanObj.dateSet.toLocaleString()})`
            })
            msg.edit(message)
        }
        else {
            const upperCaseTag = tag.toUpperCase()
            let clanObj = client.tokens.get(upperCaseTag);
            if(!clanObj) {
                msg.edit(`Couldn't find token for ${tag}`);
                return;
            }
            msg.edit(`The current stored token for ${upperCaseTag} is ${clanObj.token} (${clanObj.dateSet.toLocaleString()})`);
        }
    }

       // for setting token
       else if (action === 'clear') {
        if (message.author.permLevel !== 10) {
            msg.edit(`Only the bot owner can run this command.`)
            return;
        }

        client.tokens.clear()
        msg.edit(`All tokens cleared.`)
    }

    // for removing token
    else if (action === 'remove') {
        if (!tag) msg.edit(`Please identify which clan's token you'd like to remove.`);
        else {
            const upperCaseTag = tag.toUpperCase()
            if(!client.tokens.get(upperCaseTag)) {
                msg.edit(`Cannot find token for ${tag}`)
                return
            }
            client.tokens.delete(upperCaseTag)
            msg.edit(`${upperCaseTag} token cleared.`)
        };
    }

    // help if improperly formatted command
    else if (!action) msg.edit(`Please provide more details for token command.  Examples:
        ${message.settings.prefix}token set <clan tag> <token value>
        ${message.settings.prefix}token remove <clan tag> 
        `)

};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "Bot Owner"
};

exports.help = {
    name: "token",
    category: "Token",
    description: "For setting auth tokens from WG.",
    usage: "token <clan tag> <wsauth_token>"
};
