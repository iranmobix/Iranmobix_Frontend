import type { PanelPersonalInfo } from "../types/user-panel.types";
export function validatePanelPersonalInfo(
  value: PanelPersonalInfo,
  options: { allowMissingCompanyNationalId?: boolean } = {},
): string | null {
  if (value.accountType === "legal") {
    const company = value.company;
    if (!company?.name.trim()) return "نام سازمان را وارد کنید.";
    if (
      (!options.allowMissingCompanyNationalId || company.nationalId) &&
      !/^\d{11}$/.test(company.nationalId)
    )
      return "شناسه ملی سازمان باید ۱۱ رقم باشد.";
    if (company.registrationNumber && !/^\d+$/.test(company.registrationNumber))
      return "شماره ثبت باید عدد باشد.";
    if (company.phone && !/^0\d{10}$/.test(company.phone))
      return "شماره تلفن سازمان را با کد شهر وارد کنید.";
    if (company.mobile && !/^09\d{9}$/.test(company.mobile))
      return "شماره موبایل معتبر وارد کنید.";
    if (company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email))
      return "ایمیل معتبر وارد کنید.";
    return null;
  }
  if (!value.firstName.trim() || !value.lastName.trim())
    return "نام و نام خانوادگی را وارد کنید.";
  if (!value.isForeignNational && !/^\d{10}$/.test(value.nationalCode))
    return "کد ملی باید ۱۰ رقم باشد.";
  if (
    !/^(13|14)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(
      value.birthDate,
    )
  )
    return "روز، ماه و سال تولد را به‌درستی وارد کنید.";
  const [, month, day] = value.birthDate.split("/").map(Number);
  if (month > 6 && day > 30) return "روز تولد برای این ماه معتبر نیست.";
  return null;
}
