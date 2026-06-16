const { ModerationPipeline } = require('./packages/moderation-pipeline/dist/index.js');
const { BaseConnector } = require('./packages/connector-sdk/dist/index.js');
const crypto = require('crypto');

function uuidv4() {
  return crypto.randomUUID();
}

class MockConnector extends BaseConnector {
  constructor() {
    super({ platform: 'custom', channelId: 'test' });
  }
  async connect() { this.setStatus('CONNECTED'); }
  async disconnect() { this.setStatus('IDLE'); }

  emitMessage(text) {
    this.dispatchMessage({
      eventId: uuidv4(),
      platform: 'custom',
      timestamp: new Date().toISOString(),
      type: 'chat',
      author: { id: 'u1', name: 'Tester' },
      message: { text, fragments: [{ type: 'text', text }] }
    });
  }

  emitModeration(action, targetUserId) {
    this.emit('moderation_action', {
      eventId: uuidv4(),
      platform: 'custom',
      timestamp: new Date().toISOString(),
      type: 'moderation',
      action,
      targetUserId
    });
  }
}

async function run() {
  const connector = new MockConnector();
  await connector.start();

  const pipeline = new ModerationPipeline({
    bannedWords: ['troll', 'spam'],
    bannedWordAction: 'mask',
    maskCharacter: '*',
    spamProtectionEnabled: true,
    maxMessageHistory: 5
  });

  pipeline.addConnector(connector);

  let passed = 0;
  let expected = 4;

  pipeline.on('chat_message', (event) => {
    console.log(`[OUTPUT MASK_PIPELINE] ${event.message.text}`);
    if (event.message.text === 'hello world') passed++;
    if (event.message.text === 'this is a ***** message') passed++;
  });

  pipeline.on('moderation_action', (event) => {
    console.log(`[MODERATION] ${event.action} for ${event.targetUserId}`);
    if (event.action === 'ban' && event.targetUserId === 'u2') passed++;
  });

  console.log('Sending: "hello world"');
  connector.emitMessage('hello world');

  console.log('Sending: "this is a troll message"');
  connector.emitMessage('this is a troll message');

  const dropPipeline = new ModerationPipeline({
    bannedWords: ['spam'],
    bannedWordAction: 'drop'
  });
  dropPipeline.addConnector(connector);
  
  let dropped = true;
  dropPipeline.on('chat_message', (e) => {
    if (e.message.text.includes('spam')) {
        dropped = false;
    }
  });

  console.log('Sending: "spam this chat"');
  connector.emitMessage('spam this chat');
  
  setTimeout(() => {
    if (dropped) {
        console.log('[OUTPUT DROP_PIPELINE] Message containing "spam" was successfully dropped');
        passed++;
    } else {
        console.log('[OUTPUT DROP_PIPELINE] Message was NOT dropped! FAILED');
    }
    
    console.log('Sending: User Ban for u2');
    connector.emitModeration('ban', 'u2');

    setTimeout(() => {
        if (passed === expected) {
          console.log('\n✅ ALL TESTS PASSED');
        } else {
          console.error(`\n❌ FAILED: Expected ${expected} assertions, got ${passed}`);
        }
        process.exit(passed === expected ? 0 : 1);
    }, 100);
  }, 100);
}

run().catch(console.error);
