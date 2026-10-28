const FooterLicenses = () => {
  return (
    <section
      aria-labelledby="footer-licenses-title"
      className="flex flex-col gap-7"
    >
      <h2
        id="footer-licenses-title"
        className="text-sm font-normal text-neutral-50"
      >
        مجوزها
      </h2>

      <div className="flex gap-3" aria-hidden="true">
        {[0, 1].map((slot) => (
          <div
            key={slot}
            className="h-[134px] w-[108px] rounded-xl bg-[#e4e4e7]"
          />
        ))}
      </div>
      <p className="sr-only">تصاویر مجوزها هنوز اضافه نشده‌اند.</p>
    </section>
  );
};

export default FooterLicenses;
