import { useEffect } from 'react';
import { useChatFeed } from './hooks/useChatFeed';
import { ChatFeed } from './components/ChatFeed';
import { Dashboard } from './components/Dashboard';
import { Routes, Route } from 'react-router-dom';
import { useSettings } from './hooks/useSettings';

const VALID_THEMES = ['glass', 'minimal', 'neon', 'classic', 'retro', 'bubble', 'holographic', 'comic', 'terminal'];

function getTheme(settingsTheme: string): string {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get('theme')?.toLowerCase() || settingsTheme || 'glass';
  return VALID_THEMES.includes(theme) ? theme : 'glass';
}

function App() {
  const { settings, updateSettings } = useSettings();
  const isReaderMode = new URLSearchParams(window.location.search).get('reader') === 'true' || parseInt(window.location.port) % 2 !== 0;
  
  const theme = getTheme(settings.activeTheme);
  
  if (isReaderMode) {
    document.body.setAttribute('data-reader', 'true');
    document.body.setAttribute('data-theme', theme);
  }

  const portStr = window.location.port;
  let wsPort = '9090';
  if (import.meta.env.DEV) {
    wsPort = '9090';
  } else {
    wsPort = (portStr && isReaderMode) ? String(parseInt(portStr) - 1) : (portStr || '9090');
  }
  
  const { messages, settingsUpdate, sendCommand, statusUpdate } = useChatFeed(`ws://${window.location.hostname || 'localhost'}:${wsPort}`);

  // Sync settings updates from WebSocket to local state
  useEffect(() => {
    if (settingsUpdate) {
      updateSettings(settingsUpdate);
    }
  }, [settingsUpdate]);

  const cssVariables = {
    '--msg-font': `"${settings.fontFamily}", sans-serif`,
    '--msg-text-size': `${settings.fontSize}px`,
    '--msg-weight': settings.fontWeight,
    backgroundColor: 'transparent' // Default overlay background
  } as React.CSSProperties;

  return (
    <Routes>
      <Route path="/" element={
        <div data-theme={theme} style={cssVariables}>
          <ChatFeed messages={messages} />
        </div>
      } />
      <Route path="/dashboard/*" element={<Dashboard sendCommand={sendCommand} messages={messages} statusUpdate={statusUpdate} />} />
    </Routes>
  );
}

export default App;

