import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

export const createPluginCommand = new Command('create-plugin')
  .description('Scaffold a new StreamChats plugin')
  .argument('<name>', 'Name of the plugin directory')
  .action((name: string) => {
    const pluginDir = path.resolve(process.cwd(), 'plugins', name);
    
    if (fs.existsSync(pluginDir)) {
      console.error(`Directory already exists at ${pluginDir}`);
      process.exit(1);
    }
    
    fs.mkdirSync(pluginDir, { recursive: true });
    
    // 1. Create package.json
    const packageJson = {
      name,
      version: "1.0.0",
      description: "A StreamChats Plugin",
      main: "dist/index.js",
      scripts: {
        "build": "tsc",
        "dev": "tsc -w"
      },
      devDependencies: {
        "typescript": "^5.0.0"
      }
    };
    fs.writeFileSync(path.join(pluginDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // 2. Create manifest.json
    const manifestJson = {
      id: name,
      name: name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      version: "1.0.0",
      author: "Your Name",
      description: "My awesome StreamChats plugin.",
      entryPoint: "dist/index.js",
      permissions: ["read_chat", "send_chat"]
    };
    fs.writeFileSync(path.join(pluginDir, 'manifest.json'), JSON.stringify(manifestJson, null, 2));

    // 3. Create tsconfig.json
    const tsconfigJson = {
      "compilerOptions": {
        "target": "ES2022",
        "module": "CommonJS",
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
      },
      "include": ["src/**/*"]
    };
    fs.writeFileSync(path.join(pluginDir, 'tsconfig.json'), JSON.stringify(tsconfigJson, null, 2));

    // 4. Create src/index.ts
    fs.mkdirSync(path.join(pluginDir, 'src'));
    const indexTs = `// Plugin Entry Point
// The StreamChats global is automatically injected into the sandbox.

console.log("Plugin initialized!");

declare var StreamChats: {
  subscribe: (callback: (event: any) => void) => void;
  publish: (event: any) => void;
};

StreamChats.subscribe((event) => {
  if (event.type === 'chat') {
    console.log(\`Received message from \${event.author.name}: \${event.message.text}\`);
    
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
`;
    fs.writeFileSync(path.join(pluginDir, 'src', 'index.ts'), indexTs);

    console.log(`Plugin '${name}' scaffolded successfully in ./plugins/${name}`);
    console.log(`Next steps:`);
    console.log(`  cd plugins/${name}`);
    console.log(`  npm install`);
    console.log(`  npm run build`);
  });
