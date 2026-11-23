import type { ComponentProps } from "react";
import checkmark from "../../assets/chekbox.svg";

type Props = Omit<ComponentProps<"input">, "type">;
export default function ProductFilterCheckbox({ checked, className = "", style, ...props }: Props) {
  return <input {...props} type="checkbox" checked={checked}
    className={"size-4 shrink-0 cursor-pointer appearance-none rounded-[3px] border border-neutral-500 bg-white bg-center bg-no-repeat checked:border-primary-300 checked:bg-primary-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 disabled:cursor-not-allowed disabled:opacity-50 " + className}
    style={{ ...style, backgroundImage: checked ? 'url("' + checkmark.src + '")' : undefined, backgroundSize: "100% 100%" }} />;
}
