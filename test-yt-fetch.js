const fs = require('fs');

async function run() {
  const url = 'https://www.youtube.com/@warnerbrosclassics/live';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });
  const html = await res.text();
  fs.writeFileSync('yt-out.html', html);
  
  const initialDataMatch = html.match(/var ytInitialData\s*=\s*(\{[\s\S]*?\});<\/script>/) || html.match(/window\["ytInitialData"\]\s*=\s*(\{[\s\S]*?\});/);
  if (!initialDataMatch) return console.log('No match');
  
  const data = JSON.parse(initialDataMatch[1]);
  fs.writeFileSync('yt-data.json', JSON.stringify(data, null, 2));
  console.log('Done writing yt-data.json');
}
run();
