import type { UseFormRegister } from "react-hook-form";
import type { LoginFormValues } from "../schemas/login.schema";

type LoginFormHeaderProps = {
  value: string;
  error?: string;
  register: UseFormRegister<LoginFormValues>;
};

export default function LoginFormHeader({
  value,
  error,
  register,
}: LoginFormHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-center self-stretch">
      <div className="flex flex-col items-start justify-center gap-2 self-stretch">
        <h1 className="text-right text-xs font-medium leading-5 text-neutral-1000">
          شماره موبایل
        </h1>
        <div className="flex h-10 items-center gap-2 self-stretch rounded-md border border-[#D4D4D8] bg-white px-3 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          <input
            {...register("identifier")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+98912..."
            className="flex-1 text-right text-sm leading-6 text-neutral-600 outline-none placeholder:text-[#9A9A9A]"
          />
        </div>
      </div>
      <div className="flex flex-col items-start gap-1.5 self-stretch">
        {value && (
          <p className="text-right text-[12px] leading-5 font-normal text-[#9A9A9A]">
            کد تایید به <span>{value}</span> ارسال می‌شود.
          </p>
        )}
        {error && <p role="alert" className="text-right text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
