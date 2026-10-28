type ResultItemProps = {
  label: string;
  value: string;
};

export function ResultItem({ label, value }: ResultItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
