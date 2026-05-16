const API_KEY = "cutad_98e7ba3c88fdfe5526740ed69f59fc71267f4a69";
const BASE_URL = "/api";

export interface Drama {
  id?: string;
  fakeId?: string;
  videoFakeId?: string;
  title?: string;
  cover?: string;
  desc?: string;
  episodesCount?: number;
  provider?: string;
}

export const PROVIDERS = [
  { id: 'netshort', name: 'NetShort', url: 'https://www.netshort.com' },
  { id: 'reelshort', name: 'ReelShort', url: 'https://www.reelshort.com' },
  { id: 'freereels', name: 'FreeReels', url: 'https://www.freereels.com' },
  { id: 'goodshort', name: 'GoodShort', url: 'https://goodshort.com' },
  { id: 'dotdrama', name: 'DotDrama', url: 'https://www.dotdrama.com', icon: 'https://ui-avatars.com/api/?name=Dot+Drama&background=4f46e5&color=fff&size=128' },
  { id: 'stardusttv', name: 'StarDustTV', url: 'https://www.stardusttv.com', icon: 'https://ui-avatars.com/api/?name=Star+Dust+TV&background=f59e0b&color=fff&size=128' },
  { id: 'meloshort', name: 'MeloShort', url: 'https://www.meloshort.com', icon: 'https://ui-avatars.com/api/?name=Melo+Short&background=ec4899&color=fff&size=128' },
  { id: 'dramabite', name: 'DramaBite', url: 'https://www.dramabite.com', icon: 'https://ui-avatars.com/api/?name=Drama+Bite&background=10b981&color=fff&size=128' }
];

export interface Episode {
  id?: string;
  fakeId?: string;
  videoFakeId?: string;
  title?: string;
  url?: string;
  cover?: string;
  sort?: number;
}

export const fypApi = {
  getProvider: () => {
    return localStorage.getItem('fyp_provider') || 'netshort';
  },
  setProvider: (provider: string) => {
    localStorage.setItem('fyp_provider', provider);
    window.dispatchEvent(new Event('provider-changed'));
  },
  getRank: async (): Promise<Drama[]> => {
    const res = await fetch(`${BASE_URL}/provider/${fypApi.getProvider()}?action=rank&key=${API_KEY}`);
    const json = await res.json();
    let dataArray = json.data;
    if (dataArray && !Array.isArray(dataArray)) {
      dataArray = dataArray.items || dataArray.list || dataArray.data || [];
    }
    if (!Array.isArray(dataArray)) {
      dataArray = [];
    }
    return dataArray.map((item: any) => ({
      ...item,
      id: item.id || item.shortPlayId || item.videoFakeId || item.vod_id,
      title: item.title || item.shortPlayName || item.name || item.vod_name,
      cover: item.cover || item.shortPlayCover || item.vod_pic || item.imageUrl || item.coverImgUrl,
      episodesCount: item.episode || item.chapterCount || item.episodesCount || item.vod_remarks
    }));
  },
  search: async (q: string, providerId: string): Promise<Drama[]> => {
    try {
      const res = await fetch(`${BASE_URL}/provider/${providerId}?action=search&q=${encodeURIComponent(q)}&key=${API_KEY}`);
      const json = await res.json();
      let dataArray = json.data;
      if (dataArray && !Array.isArray(dataArray)) {
        dataArray = dataArray.items || dataArray.list || dataArray.data || [];
      }
      if (!Array.isArray(dataArray)) {
        dataArray = [];
      }
      return dataArray.map((item: any) => ({
        ...item,
        id: item.id || item.shortPlayId || item.videoFakeId || item.vod_id,
        title: item.title || item.shortPlayName || item.name || item.vod_name,
        cover: item.cover || item.shortPlayCover || item.vod_pic || item.imageUrl || item.coverImgUrl,
        episodesCount: item.episode || item.chapterCount || item.episodesCount || item.vod_remarks,
        provider: providerId
      }));
    } catch (err) {
      console.error(`Search error for ${providerId}:`, err);
      return [];
    }
  },
  getEpisodes: async (id: string): Promise<Episode[]> => {
    const res = await fetch(`${BASE_URL}/provider/${fypApi.getProvider()}?action=episodes&id=${id}&key=${API_KEY}`);
    const json = await res.json();
    return (json.data || []).map((item: any, idx: number) => ({
      ...item,
      id: item.id || item.chapterId || item.videoFakeId || item.fakeId || String(idx),
      title: item.title || item.chapterName || item.name || `Episode ${idx + 1}`,
      cover: item.cover || item.chapterImg || item.pic || item.imageUrl,
      url: item.url || item.videoUrl || item.playUrl,
      sort: item.sort ?? item.episodeNo ?? (idx + 1)
    }));
  },
  getDetail: async (id: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/provider/${fypApi.getProvider()}?action=detail&id=${id}&key=${API_KEY}`);
    const json = await res.json();
    return json.data;
  },
  getStream: async (episodeId: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/provider/${fypApi.getProvider()}?action=stream&id=${encodeURIComponent(episodeId)}&key=${API_KEY}`);
    
    if (res.status === 403) {
      const errorJson = await res.json();
      return { limitReached: true, data: errorJson };
    }
    
    const json = await res.json();
    let url = json.data?.url || json.data?.videoUrl || json.data?.playUrl || json.data?.streams?.[0]?.url || "";
    
    const origin = json.data?.headers?.Referer || json.data?.headers?.Origin || "";
    
    // Proxy m3u8 streams to bypass CORS
    if (url && (url.includes('.m3u8') || url.includes('.m3u'))) {
      url = `/api/proxy/m3u8?url=${encodeURIComponent(url)}${origin ? '&origin=' + encodeURIComponent(origin) : ''}`;
    } else if (url && origin) {
      url = `/api/proxy/ts?url=${encodeURIComponent(url)}&origin=${encodeURIComponent(origin)}`;
    }
    
    // Extract Indonesian subtitles specifically (or mapping all if needed)
    let subtitles = json.data?.subtitles || [];
    let indonesianSub = subtitles.find((s: any) => s.label === "Indonesia" || s.lang === "id-ID" || s.label?.toLowerCase() === "indonesian");
    
    if (indonesianSub) {
      // proxy and convert to vtt
      indonesianSub.url = `/api/proxy/sub?url=${encodeURIComponent(indonesianSub.url)}${origin ? '&origin=' + encodeURIComponent(origin) : ''}`;
    }
    
    return {
      url,
      subtitles: indonesianSub ? [indonesianSub] : [],
      originalUrl: json.data?.url || json.data?.videoUrl || json.data?.playUrl || json.data?.streams?.[0]?.url || "",
      origin
    };
  }
};
