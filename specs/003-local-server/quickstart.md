# Quickstart

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build --workspace=@obs-chat/local-server
```

3. Run the server:
```bash
node apps/local-server/dist/index.js
```

4. Connect a client:
```bash
wscat -c ws://localhost:9090
```
