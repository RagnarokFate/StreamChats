# Quickstart: Moderation Pipeline Testing

To verify the moderation pipeline is working:

1. Build the new package:
```bash
npm run build --workspace=@obs-chat/moderation-pipeline
```

2. Create a test script `test-moderation.js` that:
   - Instantiates `ModerationPipeline` with `bannedWords: ['troll', 'spam']` and `bannedWordAction: 'mask'`.
   - Feeds mock `chat_message` events containing those words.
   - Listens to the pipeline's output events.
   - Asserts the output text is masked or dropped based on config.
   - Tests memory bounds by feeding 1000 messages and verifying the internal history buffer length does not exceed `maxMessageHistory`.

3. Run the script:
```bash
node test-moderation.js
```
