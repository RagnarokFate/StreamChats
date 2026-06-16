const { YouTubeConnector } = require('@obs-chat/connector-youtube');

const connector = new YouTubeConnector({
  platform: 'youtube',
  channelId: '@SkyNews', // Usually 24/7 with active chat
  logLevel: 'debug'
});

connector.on('status_change', (status) => {
  console.log(`[STATUS] ${status}`);
});

connector.on('chat_message', (msg) => {
  console.log(`[CHAT] ${msg.author.name}: ${msg.message.text}`);
});

connector.on('error', (err) => {
  console.error('[ERROR]', err.message);
});

connector.start();

setTimeout(() => {
  console.log('Stopping connector...');
  connector.stop().then(() => {
    console.log('Connector stopped.');
    process.exit(0);
  });
}, 15000);
