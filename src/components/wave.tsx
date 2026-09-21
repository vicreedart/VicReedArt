export function WaveMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 78 42"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 33c15 0 17-5 29-15C43 8 55 7 64 17c-9-4-18-4-21 2-4 9 7 15 30 14M15 33c15-1 19-9 27-13M31 33c8 1 18 1 25 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function WaveDivider() {
  return (
    <div className="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0 43C150 92 226 87 360 50S506 24 610 52s188 39 292 5S1068 11 1170 40s193 39 270-5V100H0Z"
          fill="var(--paper)"
        />
        <path
          d="M0 45c150 33 205 76 358 22s139-27 178-18M835 68c109 8 184-40 290-42 111-2 224 40 315 13"
          stroke="var(--sea-light)"
          fill="none"
          strokeWidth="1.4"
        />
      </svg>
    </div>
  );
}
