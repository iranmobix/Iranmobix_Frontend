type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function FaqSearchInput({ value, onChange }: Props) {
  return (
    <input
      type="search"
      dir="rtl"
      autoComplete="off"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="جستجو..."
      className="w-full border p-2"
    />
  );
}
