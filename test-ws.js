const WebSocket = require('ws');
const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

ws.on('open', () => {
  console.log('OPEN');
  ws.send('PASS oauth:dummy\r\n');
  ws.send('NICK justinfan123\r\n');
  ws.send('JOIN #thebausffs\r\n');
});

ws.on('message', (data) => {
  console.log('MSG:', data.toString());
});

ws.on('error', (err) => {
  console.error('ERR:', err);
});

ws.on('close', () => {
  console.log('CLOSE');
});
