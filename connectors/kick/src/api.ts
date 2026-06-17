export interface KickChannelData {
  chatroom: {
    id: number;
  };
}

export async function fetchKickChannelData(channelName: string): Promise<KickChannelData> {
  const url = `https://kick.com/api/v1/channels/${channelName}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Kick channel '${channelName}' not found.`);
    }
    throw new Error(`Failed to fetch Kick channel data: ${response.statusText}`);
  }

  const data = await response.json();
  return data as KickChannelData;
}
