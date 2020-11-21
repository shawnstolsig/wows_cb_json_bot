exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const msg = await message.channel.send("Getting scheduler status...");
    const lastDate = client.scheduler.lastDate();
    const nextDates = client.scheduler.nextDates();
    msg.edit(`${client.scheduler.isRunning ? 'Scheduler is running.' : 'Scheduler is stopped.'}\nLast ran at: ${lastDate ? lastDate : 'Not run during current bot uptime.'}\nNext scheduled time: ${nextDates}`)

};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User"
};

exports.help = {
    name: "status",
    category: "JSON",
    description: "Run this command to get status of the scheduler.",
    usage: "status"
};
