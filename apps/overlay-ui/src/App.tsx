import { useChatFeed } from './hooks/useChatFeed';
import { ChatFeed } from './components/ChatFeed';

function App() {
  const messages = useChatFeed('ws://localhost:9090');

  return (
    <>
      <ChatFeed messages={messages} />
    </>
  );
}

export default App;
