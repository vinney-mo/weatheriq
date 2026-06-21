/** Maps WeatherAI condition strings to a small inline SVG glyph. Falls back
 * to a generic gauge glyph for unrecognized conditions rather than guessing.
 */
export function ConditionIcon({ condition, className = "h-8 w-8" }: { condition: string; className?: string }) {
  const c = condition.toLowerCase();

  if (c.includes("rain") || c.includes("shower")) return <RainIcon className={className} />;
  if (c.includes("cloud") || c.includes("overcast")) return <CloudIcon className={className} />;
  if (c.includes("storm") || c.includes("thunder")) return <StormIcon className={className} />;
  if (c.includes("clear") || c.includes("sun")) return <SunIcon className={className} />;
  if (c.includes("snow")) return <SnowIcon className={className} />;
  return <GaugeIcon className={className} />;
}

const stroke = { fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} stroke="currentColor" {...stroke}>
      <circle cx="12" cy="12" r="4.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="12"
          y1="2.5"
          x2="12"
          y2="4.8"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} stroke="currentColor" {...stroke}>
      <path d="M6.5 17.5a4 4 0 0 1-.5-7.96A5 5 0 0 1 15.6 8.2a4.2 4.2 0 0 1 1.9 8.1" />
      <path d="M6.5 17.5h11" />
    </svg>
  );
}

function RainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} stroke="currentColor" {...stroke}>
      <path d="M6.5 14.5a4 4 0 0 1-.5-7.96A5 5 0 0 1 15.6 5.2a4.2 4.2 0 0 1 1.9 8.1" />
      <line x1="8" y1="18" x2="7" y2="21" />
      <line x1="12" y1="18" x2="11" y2="21" />
      <line x1="16" y1="18" x2="15" y2="21" />
    </svg>
  );
}

function StormIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} stroke="currentColor" {...stroke}>
      <path d="M6.5 13.5a4 4 0 0 1-.5-7.96A5 5 0 0 1 15.6 4.2a4.2 4.2 0 0 1 1.9 8.1" />
      <path d="M13 13l-2.5 4h2.5l-2 4" />
    </svg>
  );
}

function SnowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} stroke="currentColor" {...stroke}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="5" y1="7" x2="19" y2="17" />
      <line x1="19" y1="7" x2="5" y2="17" />
    </svg>
  );
}

function GaugeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} stroke="currentColor" {...stroke}>
      <path d="M4 15a8 8 0 1 1 16 0" />
      <line x1="12" y1="15" x2="15.5" y2="10.5" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
