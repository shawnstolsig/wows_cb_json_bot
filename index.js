// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.
if (Number(process.version.slice(1).split(".")[0]) < 12) throw new Error("Node 12.0.0 or higher is required. Update Node on your system.");

// Load up the discord.js library
const Discord = require("discord.js");
// We also load the rest of the things we need in this file:
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const config = require("./config.js");

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`,
// or `bot.something`, this is what we're referring to. Your client.
const client = new Discord.Client({
  ws: {
    intents: config.intents
  }
});

// Here we load the config file that contains our token and our prefix values.
client.config = config
// client.config.token contains the bot's token
// client.config.prefix contains the message prefix

// Require our logger
client.logger = require("./modules/Logger");

// Let's start by getting some useful functions that we'll use throughout
// the bot, like logs and elevation features.
require("./modules/functions.js")(client);

// Aliases and commands are put in collections where they can be read from,
// catalogued, listed, etc.
client.commands = new Enmap();
client.aliases = new Enmap();

// Now we integrate the use of Evie's awesome EnMap module, which
// essentially saves a collection to disk. This is great for per-server configs,
// and makes things extremely easy for this purpose.
client.settings = new Enmap({ name: "settings" });

// We're doing real fancy node 8 async/await stuff here, and to do that
// we need to wrap stuff in an anonymous function. It's annoying but it works.


// Shawn's code:
client.tokens = new Enmap({ name: 'tokens' });
var CronJob = require('cron').CronJob;
require("./modules/googleFunctions.js")(client);
require("./modules/jsonFunctions.js")(client);
const path = require('path')
// const GOOGLE_DRIVE_ROOT_FOLDER = '1Yx7mSnFY7UJawqIsTfHHs_us8XgGj9Yc';        // the 'Data' folder 
const GOOGLE_DRIVE_ROOT_FOLDER = '195-tSRxwb5OxNMJV-qFW8vk8b5NR2Lh2';           // the 'KSx Clan Wars' drive
const PATH_TO_CREDENTIALS = path.resolve(`${__dirname}/google_service_account_credentials.json`);
const NodeGoogleDrive = require('node-google-drive');

console.log(PATH_TO_CREDENTIALS)

const init = async () => {

  // Here we load **commands** into memory, as a collection, so they're accessible
  // here and everywhere else.
  const cmdFiles = await readdir("./commands/");
  client.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    const response = client.loadCommand(f);
    if (response) console.log(response);
  });

  // Then we load events, which will include our message and ready event.
  const evtFiles = await readdir("./events/");
  client.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    client.logger.log(`Loading Event: ${eventName}`);
    const event = require(`./events/${file}`);
    // Bind the client to any event, before the existing arguments
    // provided by the discord.js event. 
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client));
  });

  // Generate a cache of client permissions for pretty perm names in commands.
  client.levelCache = {};
  for (let i = 0; i < client.config.permLevels.length; i++) {
    const thisLevel = client.config.permLevels[i];
    client.levelCache[thisLevel.name] = thisLevel.level;
  }

  // Setup for Google Drive connection
  const creds_service_user = require(PATH_TO_CREDENTIALS);

  const googleDriveInstance = new NodeGoogleDrive({
    ROOT_FOLDER: GOOGLE_DRIVE_ROOT_FOLDER
  });

  const gDrive = await googleDriveInstance.useServiceAccountAuth(
    creds_service_user
  );

  client.logger.log(`Successfully connected to Google Drive`, `ready`);
  client.googleDrive = googleDriveInstance
  client.googleCredentials = creds_service_user

  // List Folders under the root folder
  // let folderResponse = await client.googleDrive.listFolders(
  //   GOOGLE_DRIVE_ROOT_FOLDER,
  //   null,
  //   false
  // );

  // console.log({ folders: folderResponse.folders });

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

  // End top-level async/await function.
};

init();
