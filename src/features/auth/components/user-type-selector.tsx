import { UserType } from "../types/auth.types";

type UserTypeSelectorProps = {
  value: UserType;
  onChange: (value: UserType) => void;
};

const options = [
  { value: "real", label: "کاربر حقیقی" },
  { value: "legal", label: "کاربر حقوقی" },
] as const;

export function UserTypeSelector({ value, onChange }: UserTypeSelectorProps) {
  return (
    <div className="bg-secondary-50 mb-6 inline-flex w-fit items-center gap-1 rounded-md p-1">
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={
              isActive
                ? "h-8 rounded-[7px] bg-white px-[10px] py-1 shadow-sm"
                : "h-8 rounded-sm px-[10px] py-1"
            }
          >
            <span className={"text-neutral-1000 text-label-md"}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
