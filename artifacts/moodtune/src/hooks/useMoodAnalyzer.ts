import { useState, useCallback } from 'react';

export type MoodState = 'idle' | 'analyzing' | 'result';
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
  { progress: 12, text: "Detecting your location…" },
  { progress: 28, text: "Analyzing local weather conditions…" },
  { progress: 41, text: "Scanning browser activity…" },
  { progress: 55, text: "Reading engagement patterns…" },
  { progress: 63, text: "Estimating your current mood…" },
  { progress: 75, text: "Checking time-of-day energy levels…" },
  { progress: 90, text: "Matching music vibes…" },
  { progress: 100, text: "Generating playlist…" },
];

/**
 * Auto-detect energy level from browser signals:
 * - Time of day (natural human energy curve)
 * - Cookie count (more cookies → more active browsing session)
 * - localStorage item count (accumulated session data)
 * - Session visit count stored in localStorage
 * - Performance timing (page load speed as a proxy for device/connection activity)
 * - Random jitter to keep results feeling unique
 */
function detectEnergyFromBrowser(): EnergyLevel {
  const hour = new Date().getHours();

  // Natural energy curve by time of day
  let baseScore = 0;
  if (hour >= 6 && hour < 10) baseScore = 3;       // Morning surge
  else if (hour >= 10 && hour < 13) baseScore = 4;  // Peak morning
  else if (hour >= 13 && hour < 15) baseScore = 2;  // Post-lunch dip
  else if (hour >= 15 && hour < 18) baseScore = 3;  // Afternoon recovery
  else if (hour >= 18 && hour < 21) baseScore = 2;  // Evening wind-down
  else baseScore = 1;                               // Late night / sleep hours

  // Cookie density — more cookies = more active multi-site session
  try {
    const cookieCount = document.cookie ? document.cookie.split(';').length : 0;
    if (cookieCount > 5) baseScore += 1;
    if (cookieCount > 10) baseScore += 1;
  } catch (_) { /* ignore */ }

  // localStorage density — accumulated browsing footprint
  try {
    const lsCount = localStorage.length;
    if (lsCount > 3) baseScore += 1;
    if (lsCount > 8) baseScore += 1;
  } catch (_) { /* ignore */ }

  // Repeat visit bonus — returning users have more engaged sessions
  try {
    const visits = parseInt(localStorage.getItem('moodtune_visits') ?? '0', 10);
    const newVisits = visits + 1;
    localStorage.setItem('moodtune_visits', String(newVisits));
    if (newVisits > 1) baseScore += 1;
    if (newVisits > 3) baseScore += 1;
  } catch (_) { /* ignore */ }

  // Page load performance as a signal — fast load = high-activity device/network
  try {
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navTiming && navTiming.loadEventEnd - navTiming.startTime < 1000) {
      baseScore += 1;
    }
  } catch (_) { /* ignore */ }

  // Add controlled randomness (+/- 1) so results vary each time
  baseScore += Math.floor(Math.random() * 3) - 1;

  if (baseScore >= 6) return 'High';
  if (baseScore >= 3) return 'Medium';
  return 'Low';
}

export function useMoodAnalyzer() {
  const [state, setState] = useState<MoodState>('idle');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [fakeMessage, setFakeMessage] = useState('');
  const [result, setResult] = useState<MoodResult | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setStepText('');
    setFakeMessage('');
    setResult(null);
  }, []);

  const analyze = useCallback(async () => {
    setState('analyzing');
    setProgress(0);

    // Kick off geolocation + weather fetch immediately in the background
    // so it runs in parallel with the animation steps
    const weatherPromise: Promise<{ condition: string; weatherText: string }> = (async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
        });
        const res = await fetch(`/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        if (res.ok) {
          const data = await res.json() as { condition: string; location: string | null };
          const condition = data.condition ?? 'Clear';
          const text = data.location ? `${condition} · ${data.location}` : condition;
          return { condition, weatherText: text };
        }
        return { condition: 'Clear', weatherText: 'Weather unavailable' };
      } catch (_) {
        return { condition: 'Clear', weatherText: 'Weather unavailable' };
      }
    })();

    // Start animation loop for fake messages
    const messageInterval = setInterval(() => {
      setFakeMessage(FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)]);
    }, 1400);

    // Simulate steps with timing — slow enough to read each one comfortably
    for (const step of ANALYSIS_STEPS) {
      setStepText(step.text);
      setProgress(step.progress);
      await new Promise(r => setTimeout(r, 1600 + Math.random() * 600));
    }

    clearInterval(messageInterval);

    // By now weather fetch should be complete (ran in parallel with animation)
    const { condition: weatherCondition, weatherText } = await weatherPromise;

    // Auto-detect energy from browser signals
    const energy = detectEnergyFromBrowser();

    // Time of day
    const hour = new Date().getHours();
    let timeMod = '';
    let timeText = '';
    if (hour >= 5 && hour < 11) {
      timeMod = 'Morning';
      timeText = 'Morning 🌅';
    } else if (hour >= 11 && hour < 17) {
      timeMod = 'Afternoon';
      timeText = 'Afternoon ☀️';
    } else if (hour >= 17 && hour < 21) {
      timeMod = 'Evening';
      timeText = 'Evening 🌙';
    } else {
      timeMod = 'Late Night';
      timeText = 'Late Night 🌌';
    }

    // Map weather + time → mood
    let moodLabel = 'Vibes';
    let search = 'playlist';
    let playlistName = 'Your Mix';

    if (weatherCondition.includes('Rain') || weatherCondition.includes('Drizzle')) {
      moodLabel = 'Rainy Day Reflection';
      search = 'rainy day acoustic playlist';
      playlistName = 'Rainy Day Acoustic';
    } else if (weatherCondition.includes('Clear') && (timeMod === 'Morning' || timeMod === 'Afternoon')) {
      moodLabel = 'Sunny Good Vibes';
      search = 'happy upbeat summer playlist';
      playlistName = 'Sunny Summer Vibes';
    } else if (weatherCondition.includes('Clear') && (timeMod === 'Evening' || timeMod === 'Late Night')) {
      moodLabel = 'Late Night Chill';
      search = 'late night chill playlist';
      playlistName = 'Late Night Chill';
    } else if (weatherCondition.includes('Cloud')) {
      moodLabel = 'Cloudy Indie Thoughts';
      search = 'indie chill cloudy day playlist';
      playlistName = 'Cloudy Indie';
    } else if (weatherCondition.includes('Snow')) {
      moodLabel = 'Winter Cozy';
      search = 'cozy winter ambient playlist';
      playlistName = 'Winter Cozy';
    } else if (weatherCondition.includes('Thunder')) {
      moodLabel = 'Storm Energy';
      search = 'epic dramatic playlist';
      playlistName = 'Storm Energy';
    } else {
      moodLabel = `${timeMod} Flow`;
      search = `${timeMod.toLowerCase()} flow playlist`;
      playlistName = `${timeMod} Flow`;
    }

    // Apply energy modifier
    if (energy === 'Low') {
      search += ' chill ambient lo-fi';
      moodLabel = 'Calm ' + moodLabel;
    } else if (energy === 'High') {
      search += ' upbeat party dance';
      moodLabel = 'Energetic ' + moodLabel;
    }

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

  return { state, progress, stepText, fakeMessage, result, analyze, reset };
}
