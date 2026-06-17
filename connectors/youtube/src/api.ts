export interface LiveChatResponse {
  continuationContents?: {
    liveChatContinuation?: {
      continuations: any[];
      actions?: any[];
    };
  };
}

export async function fetchInitialData(channelOrVideoId: string): Promise<{ apiKey: string; continuation: string } | null> {
  const url = channelOrVideoId.startsWith('@') 
    ? `https://www.youtube.com/${channelOrVideoId}/live`
    : `https://www.youtube.com/watch?v=${channelOrVideoId}`;
    
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  
  const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  if (!apiKeyMatch) throw new Error('API Key not found');
  
  const initialDataMatch = html.match(/var ytInitialData\s*=\s*(\{[\s\S]*?\});<\/script>/) || html.match(/window\["ytInitialData"\]\s*=\s*(\{[\s\S]*?\});/);
  if (!initialDataMatch) throw new Error('ytInitialData not found');
  
  try {
    const data = JSON.parse(initialDataMatch[1]);
    const continuation = data?.contents?.twoColumnWatchNextResults?.conversationBar?.liveChatRenderer?.continuations?.[0]?.reloadContinuationData?.continuation 
      || data?.contents?.twoColumnWatchNextResults?.conversationBar?.liveChatRenderer?.header?.liveChatHeaderRenderer?.viewSelector?.sortFilterSubMenuRenderer?.subMenuItems?.[1]?.continuation?.reloadContinuationData?.continuation;
      
    if (!continuation) throw new Error('Continuation token not found');
    
    return { apiKey: apiKeyMatch[1], continuation };
  } catch (e) {
    console.error('JSON parse error or missing token:', e);
    // console.log('Snippet:', initialDataMatch[1].slice(0, 500)); // Uncomment to see
    throw new Error('Failed to parse initial data');
  }
}

export async function fetchLiveChat(apiKey: string, continuation: string): Promise<LiveChatResponse | null> {
  const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${apiKey}`;
  const payload = {
    context: {
      client: {
        clientName: 'WEB',
        clientVersion: '2.20260615.01.00'
      }
    },
    continuation
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json() as LiveChatResponse;
}
