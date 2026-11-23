const FooterLicenses = ({
  titleId = "footer-licenses-title",
}: {
  titleId?: string;
}) => {
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col items-center gap-7 lg:items-start"
    >
      <h2
        id={titleId}
        className="hidden text-sm font-normal text-neutral-50 lg:block"
      >
        مجوزها
      </h2>

      <div className="flex gap-[18px] lg:gap-3" aria-hidden="true">
        {[0, 1].map((slot) => (
          <div
            key={slot}
            className="h-[120px] w-[92px] rounded-xl bg-[#e4e4e7] lg:h-[134px] lg:w-[108px]"
          />
        ))}
      </div>
      <p className="sr-only">تصاویر مجوزها هنوز اضافه نشده‌اند.</p>
    </section>
  );
};

export default FooterLicenses;
