interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TokenInput({ label, value, onChange, placeholder, rows = 4 }: Props) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <textarea
        className="token"
        value={value}
        spellCheck={false}
        autoComplete="off"
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ minHeight: rows * 22 }}
      />
    </div>
  );
}
