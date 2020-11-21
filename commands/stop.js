exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const msg = await message.channel.send("Stopping scheduler...");
    client.scheduler.stop()
    client.scheduler.isRunning = false;
    msg.edit("Scheduler stopped.")
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "Bot Owner"
};

exports.help = {
    name: "stop",
    category: "JSON",
    description: "Run this command to turn scheduler off for automatically downloading JSON files.",
    usage: "stop"
};
