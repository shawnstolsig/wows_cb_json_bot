const Discord = require("discord.js");
const Enmap = require("enmap");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const config = require("./config.js");

// my imports
const CronJob = require('cron').CronJob;
// const google = require('googleapis');
const google = require('googleapis');
// const {JWT} = require('google-auth-library')
const keys = require('./google_service_account_credentials.json')

// Ensure correct Node version
if (Number(process.version.slice(1).split(".")[0]) < 12) throw new Error("Node 12.0.0 or higher is required. Update Node on your system.");

// Instantiate the bot client
const client = new Discord.Client({
  ws: {
    intents: config.intents
  }
});

// a few more imports that rely on client
require("./modules/functions.js")(client); // some useful functions used throughout
require("./modules/googleFunctions.js")(client);
require("./modules/jsonFunctions.js")(client);

// Add a few things to our client, since it is now created
client.config = config
client.logger = require("./modules/Logger");

// Aliases and commands are put in collections where they can be read from.
client.commands = new Enmap();
client.aliases = new Enmap();
client.settings = new Enmap({ name: "settings" });   // will persist when bot shuts down, useful for guild settings

// Shawn's code:
client.tokens = new Enmap({ name: 'tokens' });

const init = async () => {

  // Load commands into memory
  const cmdFiles = await readdir("./commands/");
  client.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    const response = client.loadCommand(f);
    if (response) console.log(response);
  });

  // Load events
  const evtFiles = await readdir("./events/");
  client.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    client.logger.log(`Loading Event: ${eventName}`);
    const event = require(`./events/${file}`);
    // Bind our client to any event, before the existing arguments
    client.on(eventName, event.bind(null, client));
  });

  // Generate a cache of client permissions for pretty perm names in commands.
  client.levelCache = {};
  for (let i = 0; i < client.config.permLevels.length; i++) {
    const thisLevel = client.config.permLevels[i];
    client.levelCache[thisLevel.name] = thisLevel.level;
  }

  // initialize and authenticate google drive
  try {
    const auth = new google.auth.JWT(
        keys.client_email,
        null,
        keys.private_key,
        ['https://www.googleapis.com/auth/drive']
        );
    client.drive = google.drive({ version: "v3", auth });

    client.logger.log(`Successfully connected to Google Drive`, `ready`);

  } catch (err) {
    client.logger.log(`Failed to authenticate with Google ${err}`,'warn')
  }

  // A test function for the scheduler
  const testFunction = () => {
    console.log("Test, hi!")
  }

  // The cron scheduler for downloading JSON files
  // Constructor params: schedule, function to run at scheduled time, function to run on stop(), job starts automatically?, timezone
  // client.scheduler = new CronJob('0 21 * * 2,3,5,6', testFunction, null, true, 'America/Los_Angeles');     
  client.scheduler = new CronJob('* * * * * *', testFunction, null, false, 'America/Los_Angeles');
  client.scheduler.isRunning = true;

  // Here we login the client.
  client.login(client.config.token);

};

init();
