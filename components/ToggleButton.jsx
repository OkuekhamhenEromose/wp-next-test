export default function ToggleButton({
  showAll,
  onToggle,
  totalCount,
  disabled = false,
}) {
  const label = showAll
    ? 'Show 3 recent posts'
    : `Show all ${totalCount} posts`;

  return (
    <button
      className={`toggle-btn${showAll ? ' toggle-btn--active' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={showAll}
    >
      {label}
    </button>
  );
}