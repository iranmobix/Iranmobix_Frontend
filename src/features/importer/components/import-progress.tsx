type Props = {
  status: "pending" | "done" | "failed";
};

export function ImportProgress({ status }: Props) {
  if (status === "pending") {
    return <p>در حال دریافت و پردازش اطلاعات...</p>;
  }

  if (status === "done") {
    return <p>محصول با موفقیت ایمپورت شد.</p>;
  }

  return <p>عملیات با خطا مواجه شد.</p>;
}
