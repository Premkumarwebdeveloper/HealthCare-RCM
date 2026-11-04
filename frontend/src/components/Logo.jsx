export default function Logo({ size = 28, light = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M12 2h8v10h10v8H20v10h-8V20H2v-8h10z"
        fill="none"
        stroke={light ? '#4da3ff' : '#1d6ff2'}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
