"use client";

import LoginFormHeader from "./login-form-header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginFormValues } from "../schemas/login.schema";
import { Button } from "@/components/ui/button";
import type { UserType } from "../types/auth.types";

type IdentityFormProps = {
  onSuccess: (identifier: string, userType: UserType) => void;
  loading?: boolean;
};

export function IdentityForm({ onSuccess, loading }: IdentityFormProps) {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const userType: UserType = "real";

  const identifier = watch("identifier");

  const submit = handleSubmit((data) => {
    const mobile = data.identifier.startsWith("+98")
      ? `0${data.identifier.slice(3)}`
      : data.identifier;
    onSuccess(mobile, userType);
  });

  return (
    <form onSubmit={submit} className="flex w-full flex-col">
      <div className="flex flex-col gap-6">
        <LoginFormHeader
          value={identifier}
          error={errors.identifier?.message}
          register={register}
        />

        <div className="flex items-start justify-center self-stretch rounded-lg">
          <Button type="submit" disabled={loading} className="h-10 w-full">
            <span className="text-sm leading-5 font-semibold text-white">
              {loading ? "در حال ارسال..." : "ارسال کد تایید"}
            </span>
          </Button>
        </div>
      </div>
    </form>
  );
}
