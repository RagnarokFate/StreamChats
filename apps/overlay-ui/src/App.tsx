import { useChatFeed } from './hooks/useChatFeed';
import { ChatFeed } from './components/ChatFeed';

const VALID_THEMES = ['glass', 'minimal', 'neon', 'classic', 'retro', 'bubble', 'holographic', 'comic', 'terminal'];

function getTheme(): string {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get('theme')?.toLowerCase() || 'glass';
  return VALID_THEMES.includes(theme) ? theme : 'glass';
}

function App() {
  const messages = useChatFeed('ws://localhost:9090');
  const theme = getTheme();

  return (
    <div data-theme={theme}>
      <ChatFeed messages={messages} />
    </div>
  );
}

export default App;
