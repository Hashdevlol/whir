const BLADE = 'M50 50 C 46.5 40.5, 50.5 28.5, 65 22 C 64.5 33.5, 60.5 43, 50 50Z';

/** The three white blades of the Whir fan, on a 100×100 grid centred at 50,50. */
export function Blades({ fill = '#FFFFFF' }: { fill?: string }) {
  return (
    <>
      {[0, 120, 240].map((r) => <path key={r} d={BLADE} transform={`rotate(${r} 50 50)`} fill={fill} />)}
    </>
  );
}

/** Whir mark: a black fan disc with three white blades. `spin` = the node is running. */
export function LogoMark({ size = 22, invert = false, spin = false }: { size?: number; invert?: boolean; spin?: boolean }) {
  const disc = invert ? '#FFFFFF' : '#1D1D1F';
  const blade = invert ? '#1D1D1F' : '#FFFFFF';
  return (
    <svg viewBox="10 10 80 80" width={size} height={size} aria-hidden="true" className="mark-svg">
      <circle cx="50" cy="50" r="40" fill={disc} />
      <g className={spin ? 'blades spinning' : 'blades'}><Blades fill={blade} /></g>
    </svg>
  );
}

/** Wordmark lockup: mark + "whir" set in Inter Display. */
export function Wordmark({ size = 22, invert = false }: { size?: number; invert?: boolean }) {
  return (
    <span className="wordmark" style={{ fontSize: size * 1.3, gap: size * 0.3 }}>
      <LogoMark size={size} invert={invert} />
      <span>whir</span>
    </span>
  );
}
