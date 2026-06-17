const fs = require('fs');

async function testFetch() {
  const html = fs.readFileSync('yt-out.html', 'utf8');
  const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  const apiKey = apiKeyMatch[1];
  
  const data = JSON.parse(fs.readFileSync('yt-data.json', 'utf8'));
  const continuation = data?.contents?.twoColumnWatchNextResults?.conversationBar?.liveChatRenderer?.header?.liveChatHeaderRenderer?.viewSelector?.sortFilterSubMenuRenderer?.subMenuItems?.[1]?.continuation?.reloadContinuationData?.continuation;
  
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
  
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text.substring(0, 500));
}

testFetch();
