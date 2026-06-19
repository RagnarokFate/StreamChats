import { useChatFeed } from './hooks/useChatFeed';
import { ChatFeed } from './components/ChatFeed';

const VALID_THEMES = ['glass', 'minimal', 'neon', 'classic', 'retro', 'bubble', 'holographic', 'comic', 'terminal'];

function getTheme(): string {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get('theme')?.toLowerCase() || 'glass';
  return VALID_THEMES.includes(theme) ? theme : 'glass';
}

function App() {
  const isReaderMode = new URLSearchParams(window.location.search).get('reader') === 'true' || parseInt(window.location.port) % 2 !== 0; // simplistic check, if port is 9091
  
  const theme = getTheme();
  
  if (isReaderMode) {
    document.body.setAttribute('data-reader', 'true');
    document.body.setAttribute('data-theme', theme);
  }

  // If we are on port 9091, connect to 9090
  const portStr = window.location.port;
  const wsPort = (portStr && isReaderMode) ? String(parseInt(portStr) - 1) : (portStr || '9090');
  
  const messages = useChatFeed(`ws://${window.location.hostname || 'localhost'}:${wsPort}`);

  return (
    <div data-theme={theme}>
      <ChatFeed messages={messages} />
    </div>
  );
}

export default App;
