import { useState, useCallback } from 'react';

export type MoodState = 'idle' | 'requesting-location' | 'analyzing' | 'result';
export type EnergyLevel = 'Low' | 'Medium' | 'High';

export interface MoodResult {
  moodLabel: string;
  weatherText: string;
  timeText: string;
  playlistName: string;
  playlistDescription: string;
  searchQuery: string;
  detectedEnergy: EnergyLevel;
}

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
  { progress: 100, text: "Generating playlist…" },
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
    const visits = parseInt(localStorage.getItem('moodtune_visits') ?? '0', 10);
    const newVisits = visits + 1;
    localStorage.setItem('moodtune_visits', String(newVisits));
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

export function useMoodAnalyzer() {
  const [state, setState] = useState<MoodState>('idle');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [fakeMessage, setFakeMessage] = useState('');
  const [result, setResult] = useState<MoodResult | null>(null);
  // Stored device coords from the permission step
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setStepText('');
    setFakeMessage('');
    setResult(null);
    setCoords(null);
  }, []);

  // Step 1: user clicks "Boost My Mood" → go to location permission screen
  const requestLocation = useCallback(() => {
    setState('requesting-location');
  }, []);

  // Step 2a: user clicks Allow on location screen → trigger browser geolocation
  const grantLocation = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          resolve();
        },
        () => {
          // Denied or failed — proceed without coords
          setCoords(null);
          resolve();
        },
        { timeout: 30000, enableHighAccuracy: false },
      );
    });
  }, []);

  // Step 2b: user skips location
  const skipLocation = useCallback(() => {
    setCoords(null);
  }, []);

  // Step 3: run the analysis animation + fetch weather using stored coords
  const analyze = useCallback(async (resolvedCoords: { lat: number; lon: number } | null) => {
    setState('analyzing');
    setProgress(0);

    // Start weather fetch in background using device coords
    const weatherPromise = resolvedCoords
      ? fetchWeather(resolvedCoords.lat, resolvedCoords.lon)
      : Promise.resolve({ condition: 'Clear', weatherText: 'Weather unavailable' });

    // Fake message loop
    const messageInterval = setInterval(() => {
      setFakeMessage(FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)]);
    }, 1400);

    // Animate steps
    for (const step of ANALYSIS_STEPS) {
      setStepText(step.text);
      setProgress(step.progress);
      await new Promise(r => setTimeout(r, 1600 + Math.random() * 600));
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

    let moodLabel = `${timeMod} Flow`;
    let search = `${timeMod.toLowerCase()} flow playlist`;
    let playlistName = `${timeMod} Flow`;

    if (weatherCondition.includes('Rain') || weatherCondition.includes('Drizzle')) {
      moodLabel = 'Rainy Day Reflection'; search = 'rainy day acoustic playlist'; playlistName = 'Rainy Day Acoustic';
    } else if (weatherCondition.includes('Clear') && (timeMod === 'Morning' || timeMod === 'Afternoon')) {
      moodLabel = 'Sunny Good Vibes'; search = 'happy upbeat summer playlist'; playlistName = 'Sunny Summer Vibes';
    } else if (weatherCondition.includes('Clear') && (timeMod === 'Evening' || timeMod === 'Late Night')) {
      moodLabel = 'Late Night Chill'; search = 'late night chill playlist'; playlistName = 'Late Night Chill';
    } else if (weatherCondition.includes('Cloud')) {
      moodLabel = 'Cloudy Indie Thoughts'; search = 'indie chill cloudy day playlist'; playlistName = 'Cloudy Indie';
    } else if (weatherCondition.includes('Snow')) {
      moodLabel = 'Winter Cozy'; search = 'cozy winter ambient playlist'; playlistName = 'Winter Cozy';
    } else if (weatherCondition.includes('Thunder')) {
      moodLabel = 'Storm Energy'; search = 'epic dramatic playlist'; playlistName = 'Storm Energy';
    }

    if (energy === 'Low') { search += ' chill ambient lo-fi'; moodLabel = 'Calm ' + moodLabel; }
    else if (energy === 'High') { search += ' upbeat party dance'; moodLabel = 'Energetic ' + moodLabel; }

    const randomMoods = ['Chill', 'Nostalgic', 'Focus', 'Party', 'Romantic', 'Adventure', 'Deep Thinking'];
    const randomMood = randomMoods[Math.floor(Math.random() * randomMoods.length)];

    setResult({
      moodLabel: `${randomMood} ${moodLabel}`,
      weatherText,
      timeText,
      playlistName,
      playlistDescription: `A curated selection of tracks matching your ${energy.toLowerCase()} energy and the ${timeText.toLowerCase()} atmosphere.`,
      searchQuery: encodeURIComponent(search),
      detectedEnergy: energy,
    });
    setState('result');
  }, []);

  return { state, coords, progress, stepText, fakeMessage, result, requestLocation, grantLocation, skipLocation, analyze, reset };
}
