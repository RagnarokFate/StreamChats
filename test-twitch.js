const { TwitchConnector } = require('@obs-chat/connector-twitch');

const connector = new TwitchConnector({
  platform: 'twitch',
  channelId: 'twitch', // The official twitch channel is usually a safe bet, or 'esl_csgo'
  logLevel: 'debug'
});

connector.on('status_change', (status) => {
  console.log(`[STATUS] ${status}`);
});

connector.on('chat_message', (msg) => {
  console.log(`[CHAT] ${msg.author.name}: ${msg.message.text}`);
});

connector.start();

// Run for 5 seconds then stop
setTimeout(() => {
  console.log('Stopping connector...');
  connector.stop().then(() => {
    console.log('Connector stopped.');
    process.exit(0);
  });
}, 5000);
