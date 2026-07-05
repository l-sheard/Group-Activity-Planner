import { useEffect, useState } from "react";
import { fetchWeather, weatherEmoji, weatherLabel } from "../lib/weather";

export default function WeatherPill({ location, dateISO }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setWeather(null);
    fetchWeather(location, dateISO).then((w) => {
      if (!cancelled) setWeather(w);
    });
    return () => {
      cancelled = true;
    };
  }, [location, dateISO]);

  if (!weather) return null;
  const prefix = weather.kind === "average" ? "Avg " : "";
  const title = weather.kind === "average" ? "Long-range forecast not yet available — showing last year as a rough guide" : undefined;

  return (
    <span
      className="inline-block ml-2 bg-pastel-sky-bg text-pastel-sky-fg rounded-full px-2.5 py-0.5 text-xs font-semibold align-middle"
      title={title}
    >
      {weatherEmoji(weather.code)} {prefix}
      {weather.tempMax}° / {weather.tempMin}° · {weatherLabel(weather.code)}
    </span>
  );
}
