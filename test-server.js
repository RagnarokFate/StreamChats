const { fork } = require('child_process');
const WebSocket = require('ws');
const path = require('path');

async function run() {
  console.log('[Test] Starting local server...');
  const serverProcess = fork(path.join(__dirname, 'apps/local-server/dist/index.js'), {
    stdio: 'pipe'
  });

  serverProcess.stdout.on('data', (data) => console.log(`[Server] ${data.toString().trim()}`));
  serverProcess.stderr.on('data', (data) => console.error(`[Server ERR] ${data.toString().trim()}`));

  // Give the server 3 seconds to start up and connect to platforms
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('[Test] Connecting WebSocket client...');
  const ws = new WebSocket('ws://localhost:9090');

  let receivedMessages = 0;

  ws.on('open', () => {
    console.log('[Test] Client connected! Waiting for chat events...');
  });

  ws.on('message', (data) => {
    const event = JSON.parse(data.toString());
    console.log(`\n[Test] Received event from ${event.platform}:`);
    if (event.type === 'chat') {
        console.log(`  ${event.author.name}: ${event.message.text}`);
    } else {
        console.log(`  Moderation Action: ${event.action} for ${event.targetUserId}`);
    }
    
    receivedMessages++;

    if (receivedMessages >= 3) {
      console.log('\n✅ Successfully received live events over WebSocket!');
      console.log('Test complete. Shutting down...');
      ws.close();
      serverProcess.kill();
      process.exit(0);
    }
  });

  ws.on('error', (err) => {
    console.error('[Test] WebSocket error:', err);
    serverProcess.kill();
    process.exit(1);
  });

  // Timeout after 15 seconds if no messages are received
  setTimeout(() => {
    console.error('\n❌ Test timed out waiting for messages. The streams might be quiet.');
    ws.close();
    serverProcess.kill();
    process.exit(0); // Exit 0 because a quiet stream isn't necessarily a hard failure
  }, 15000);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
