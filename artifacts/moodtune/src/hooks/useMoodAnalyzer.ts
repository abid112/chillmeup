import { useState, useCallback } from 'react';

export type MoodState = 'idle' | 'requesting-location' | 'analyzing' | 'result';
export type EnergyLevel = 'Low' | 'Medium' | 'High';

export interface MoodResult {
  moodLabel: string;
  weatherText: string;
  timeText: string;
  playlistName: string;
  playlistDescription: string;
  playlistId: string;
  detectedEnergy: EnergyLevel;
}

// ---------------------------------------------------------------------------
// Only IDs verified to be live Spotify editorial playlists.
// Format: open.spotify.com/playlist/{id}
// ---------------------------------------------------------------------------
const P = {
  rainyDay:      { id: '37i9dQZF1DXbvABJXBIyiY', name: 'Rainy Day' },
  peacefulPiano: { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano' },
  happyHits:     { id: '37i9dQZF1DXdPec7aLTmlC', name: 'Happy Hits!' },
  rockClassics:  { id: '37i9dQZF1DWXRqgorJj26U', name: 'Rock Classics' },
} as const;

type PlaylistKey = keyof typeof P;

// mood key → [Low energy, Medium energy, High energy]
// Keys must match the output of: timeMod.toLowerCase().replace(' ', '')
const MOOD_MAP: Record<string, [PlaylistKey, PlaylistKey, PlaylistKey]> = {
  rain:       ['peacefulPiano', 'rainyDay',      'rainyDay'],
  sunnyDay:   ['peacefulPiano', 'happyHits',     'happyHits'],
  clearNight: ['peacefulPiano', 'peacefulPiano', 'happyHits'],
  cloudy:     ['peacefulPiano', 'rainyDay',      'happyHits'],
  snow:       ['peacefulPiano', 'peacefulPiano', 'happyHits'],
  thunder:    ['rockClassics',  'rockClassics',  'rockClassics'],
  morning:    ['peacefulPiano', 'happyHits',     'happyHits'],
  afternoon:  ['peacefulPiano', 'happyHits',     'happyHits'],
  evening:    ['peacefulPiano', 'peacefulPiano', 'happyHits'],
  latenight:  ['peacefulPiano', 'peacefulPiano', 'happyHits'],
};

// ---------------------------------------------------------------------------

const FAKE_MESSAGES = [
  "Scanning emotional signals…",
  "Matching your vibe with global music trends…",
  "Detecting hidden nostalgia levels…",
  "Cross-referencing your aura with 47 million songs…",
  "Calibrating nostalgia index…",
  "Harmonizing soundwaves…",
  "Synthesizing current frequency…",
  "Analyzing session entropy…",
  "Reading ambient engagement patterns…",
  "Parsing micro-interaction velocity…",
];

const ANALYSIS_STEPS = [
  { progress: 12, text: "Pinpointing your location…" },
  { progress: 28, text: "Analyzing local weather conditions…" },
  { progress: 41, text: "Scanning browser activity…" },
  { progress: 55, text: "Reading engagement patterns…" },
  { progress: 63, text: "Estimating your current mood…" },
  { progress: 75, text: "Checking time-of-day energy levels…" },
  { progress: 90, text: "Matching music vibes…" },
  { progress: 100, text: "Curating your playlist…" },
];

function detectEnergyFromBrowser(): EnergyLevel {
  const hour = new Date().getHours();
  let baseScore = 0;
  if (hour >= 6 && hour < 10) baseScore = 3;
  else if (hour >= 10 && hour < 13) baseScore = 4;
  else if (hour >= 13 && hour < 15) baseScore = 2;
  else if (hour >= 15 && hour < 18) baseScore = 3;
  else if (hour >= 18 && hour < 21) baseScore = 2;
  else baseScore = 1;

  try {
    const cookieCount = document.cookie ? document.cookie.split(';').length : 0;
    if (cookieCount > 5) baseScore += 1;
    if (cookieCount > 10) baseScore += 1;
  } catch (_) { /* ignore */ }

  try {
    const lsCount = localStorage.length;
    if (lsCount > 3) baseScore += 1;
    if (lsCount > 8) baseScore += 1;
  } catch (_) { /* ignore */ }

  try {
    const visits = parseInt(localStorage.getItem('chillmeup_visits') ?? '0', 10);
    const newVisits = visits + 1;
    localStorage.setItem('chillmeup_visits', String(newVisits));
    if (newVisits > 1) baseScore += 1;
    if (newVisits > 3) baseScore += 1;
  } catch (_) { /* ignore */ }

  try {
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navTiming && navTiming.loadEventEnd - navTiming.startTime < 1000) baseScore += 1;
  } catch (_) { /* ignore */ }

  baseScore += Math.floor(Math.random() * 3) - 1;
  if (baseScore >= 6) return 'High';
  if (baseScore >= 3) return 'Medium';
  return 'Low';
}

async function fetchWeather(lat: number, lon: number): Promise<{ condition: string; weatherText: string }> {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const data = await res.json() as { condition: string; location: string | null };
      const condition = data.condition ?? 'Clear';
      const text = data.location ? `${condition} · ${data.location}` : condition;
      return { condition, weatherText: text };
    }
  } catch (_) { /* fall through */ }
  return { condition: 'Clear', weatherText: 'Weather unavailable' };
}

function resolvePlaylist(
  moodKey: string,
  energy: EnergyLevel,
): { id: string; name: string } {
  const keys = MOOD_MAP[moodKey] ?? MOOD_MAP['afternoon'];
  const idx = energy === 'Low' ? 0 : energy === 'Medium' ? 1 : 2;
  return P[keys[idx]];
}

export function useMoodAnalyzer() {
  const [state, setState] = useState<MoodState>('idle');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [fakeMessage, setFakeMessage] = useState('');
  const [result, setResult] = useState<MoodResult | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setStepText('');
    setFakeMessage('');
    setResult(null);
    setCoords(null);
  }, []);

  const requestLocation = useCallback(() => {
    setState('requesting-location');
  }, []);

  const grantLocation = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); resolve(); },
        () => { setCoords(null); resolve(); },
        { timeout: 30000, enableHighAccuracy: false },
      );
    });
  }, []);

  const skipLocation = useCallback(() => { setCoords(null); }, []);

  const analyze = useCallback(async (resolvedCoords: { lat: number; lon: number } | null) => {
    setState('analyzing');
    setProgress(0);

    const weatherPromise = resolvedCoords
      ? fetchWeather(resolvedCoords.lat, resolvedCoords.lon)
      : Promise.resolve({ condition: 'Clear', weatherText: 'Weather unavailable' });

    const messageInterval = setInterval(() => {
      setFakeMessage(FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)]);
    }, 2600);

    for (const step of ANALYSIS_STEPS) {
      setStepText(step.text);
      setProgress(step.progress);
      await new Promise(r => setTimeout(r, 2800 + Math.random() * 1000));
    }

    clearInterval(messageInterval);

    const { condition: weatherCondition, weatherText } = await weatherPromise;
    const energy = detectEnergyFromBrowser();

    const hour = new Date().getHours();
    let timeMod = '';
    let timeText = '';
    if (hour >= 5 && hour < 11) { timeMod = 'Morning'; timeText = 'Morning 🌅'; }
    else if (hour >= 11 && hour < 17) { timeMod = 'Afternoon'; timeText = 'Afternoon ☀️'; }
    else if (hour >= 17 && hour < 21) { timeMod = 'Evening'; timeText = 'Evening 🌙'; }
    else { timeMod = 'Late Night'; timeText = 'Late Night 🌌'; }

    // Determine mood key from weather + time
    let moodKey = timeMod.toLowerCase().replace(' ', '');  // morning|afternoon|evening|latenight
    let moodLabel = `${timeMod} Flow`;

    if (weatherCondition.includes('Rain') || weatherCondition.includes('Drizzle')) {
      moodKey = 'rain'; moodLabel = 'Rainy Day Reflection';
    } else if (weatherCondition.includes('Thunder')) {
      moodKey = 'thunder'; moodLabel = 'Storm Energy';
    } else if (weatherCondition.includes('Snow')) {
      moodKey = 'snow'; moodLabel = 'Winter Cozy';
    } else if (weatherCondition.includes('Cloud') || weatherCondition.includes('Fog')) {
      moodKey = 'cloudy'; moodLabel = 'Cloudy Indie Thoughts';
    } else if (weatherCondition.includes('Clear') && (timeMod === 'Morning' || timeMod === 'Afternoon')) {
      moodKey = 'sunnyDay'; moodLabel = 'Sunny Good Vibes';
    } else if (weatherCondition.includes('Clear') && (timeMod === 'Evening' || timeMod === 'Late Night')) {
      moodKey = 'clearNight'; moodLabel = 'Clear Night Chill';
    }

    if (energy === 'Low') moodLabel = 'Calm ' + moodLabel;
    else if (energy === 'High') moodLabel = 'Energetic ' + moodLabel;

    const { id: playlistId, name: playlistName } = resolvePlaylist(moodKey, energy);

    const randomMoods = ['Chill', 'Nostalgic', 'Focus', 'Party', 'Romantic', 'Adventure', 'Deep Thinking'];
    const randomMood = randomMoods[Math.floor(Math.random() * randomMoods.length)];

    setResult({
      moodLabel: `${randomMood} ${moodLabel}`,
      weatherText,
      timeText,
      playlistName,
      playlistDescription: `A curated Spotify playlist for your ${energy.toLowerCase()} energy and ${timeText.toLowerCase()} mood.`,
      playlistId,
      detectedEnergy: energy,
    });
    setState('result');
  }, []);

  return { state, coords, progress, stepText, fakeMessage, result, requestLocation, grantLocation, skipLocation, analyze, reset };
}
