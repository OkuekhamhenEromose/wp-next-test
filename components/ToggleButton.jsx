/**
 * ToggleButton — controls the "show 3 recent / show all" switch.
 * Pure presentational: no state, no fetching. Parent owns the logic.
 *
 * @param {{
 *   showAll:    boolean,
 *   onToggle:   () => void,
 *   totalCount: number,
 *   disabled?:  boolean
 * }} props
 */
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