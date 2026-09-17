import type { Choice } from '../contracts';

type VoteChoiceProps = {
  choice: Choice;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: (choice: Choice) => void;
};

export function VoteChoice({
  choice,
  label,
  selected = false,
  disabled = false,
  onSelect,
}: VoteChoiceProps) {
  return (
    <button
      type="button"
      className={`vote-choice vote-choice--${choice.toLowerCase()}${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect?.(choice)}
    >
      <span className="vote-choice__badge">{choice}</span>
      <span>{label}</span>
    </button>
  );
}
