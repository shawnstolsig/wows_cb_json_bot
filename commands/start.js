exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const msg = await message.channel.send("Starting scheduler...");
    client.scheduler.start()
    client.cronIsRunning = true;
    msg.edit(`Scheduler started.`)

};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User"
};

exports.help = {
    name: "start",
    category: "JSON",
    description: "Run this command to turn scheduler on for automatically downloading JSON files.",
    usage: "start"
};
