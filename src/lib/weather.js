// ---------- Weather (Open-Meteo, no API key) ----------
const geocodeCache = new Map(); // location(lowercase) -> place | null
const weatherCache = new Map(); // "location|date" -> {tempMax, tempMin, code, kind} | null

export function weatherEmoji(code) {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "⛅";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 86) return "🌦️";
  if (code >= 95) return "⛈️";
  return "☁️";
}

export function weatherLabel(code) {
  if (code === 0) return "Clear";
  if (code >= 1 && code <= 3) return "Partly cloudy";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 86) return "Showers";
  if (code >= 95) return "Thunder";
  return "Cloudy";
}

async function geocodeLocation(location) {
  const key = location.toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key);
  try {
    const gRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
    const gJson = await gRes.json();
    const place = gJson?.results?.[0] || null;
    geocodeCache.set(key, place);
    return place;
  } catch {
    geocodeCache.set(key, null);
    return null;
  }
}

export async function fetchWeather(location, dateISO) {
  if (!location || !dateISO) return null;
  const key = `${location.toLowerCase()}|${dateISO}`;
  if (weatherCache.has(key)) return weatherCache.get(key);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateISO + "T00:00");
  const diffDays = Math.round((eventDate - today) / 86_400_000);
  if (diffDays < 0) {
    weatherCache.set(key, null);
    return null;
  }

  const place = await geocodeLocation(location);
  if (!place) {
    weatherCache.set(key, null);
    return null;
  }

  const pad2 = (n) => String(n).padStart(2, "0");
  try {
    if (diffDays <= 15) {
      // Real forecast within 16-day window
      const fRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
          `&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${dateISO}&end_date=${dateISO}&timezone=auto`
      );
      const fJson = await fRes.json();
      const d = fJson?.daily;
      if (!d?.weathercode?.length) {
        weatherCache.set(key, null);
        return null;
      }
      const out = {
        tempMax: Math.round(d.temperature_2m_max[0]),
        tempMin: Math.round(d.temperature_2m_min[0]),
        code: d.weathercode[0],
        kind: "forecast",
      };
      weatherCache.set(key, out);
      return out;
    }

    // Beyond 16 days: fetch ERA5 long-term average for that calendar week using last year as a rough proxy
    const lastYearStart = `${eventDate.getFullYear() - 1}-${pad2(eventDate.getMonth() + 1)}-${pad2(eventDate.getDate())}`;
    const aRes = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${place.latitude}&longitude=${place.longitude}` +
        `&start_date=${lastYearStart}&end_date=${lastYearStart}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
    );
    const aJson = await aRes.json();
    const d = aJson?.daily;
    if (!d?.weathercode?.length) {
      weatherCache.set(key, null);
      return null;
    }
    const out = {
      tempMax: Math.round(d.temperature_2m_max[0]),
      tempMin: Math.round(d.temperature_2m_min[0]),
      code: d.weathercode[0],
      kind: "average",
    };
    weatherCache.set(key, out);
    return out;
  } catch (e) {
    console.warn("Weather fetch failed:", e);
    weatherCache.set(key, null);
    return null;
  }
}
