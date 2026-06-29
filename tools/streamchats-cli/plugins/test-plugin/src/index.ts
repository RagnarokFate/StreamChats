// Plugin Entry Point
// The StreamChats global is automatically injected into the sandbox.

console.log("Plugin initialized!");

declare var StreamChats: {
  subscribe: (callback: (event: any) => void) => void;
  publish: (event: any) => void;
};

StreamChats.subscribe((event) => {
  if (event.type === 'chat') {
    console.log(`Received message from ${event.author.name}: ${event.message.text}`);
    
    // Example: Auto-reply to a command
    if (event.message.text === '!ping') {
      StreamChats.publish({
        eventId: 'plugin-' + Date.now(),
        type: 'chat',
        platform: event.platform,
        author: {
          id: 'system',
          name: 'SystemBot'
        },
        message: { text: 'Pong!' },
        moderationStatus: 'visible',
        timestamp: new Date().toISOString()
      });
    }
  }
});
