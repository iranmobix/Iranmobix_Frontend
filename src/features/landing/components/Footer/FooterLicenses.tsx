const ENAMAD_CODE = "CkuRkiKZcloMDNwXc6qjmZaPMtcTEOtU";
const ENAMAD_QUERY = "id=7502693&Code=" + ENAMAD_CODE;

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

      <div className="flex gap-[18px] lg:gap-3">
        <a
          referrerPolicy="origin"
          target="_blank"
          rel="noopener"
          href={"https://trustseal.enamad.ir/?" + ENAMAD_QUERY}
          aria-label="مشاهده اعتبار نماد اعتماد الکترونیکی ایران موبیکس"
          className="focus-visible:ring-secondary-500 flex h-[120px] w-[92px] items-center justify-center overflow-hidden rounded-xl bg-[#e4e4e7] focus-visible:ring-2 focus-visible:outline-none lg:h-[134px] lg:w-[108px]"
        >
          {/* The official trust seal must load directly with its referrer policy and verification code. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            referrerPolicy="origin"
            src={"https://trustseal.enamad.ir/logo.aspx?" + ENAMAD_QUERY}
            alt="نماد اعتماد الکترونیکی"
            width={92}
            height={120}
            className="h-full w-full cursor-pointer object-contain"
            {...{ code: ENAMAD_CODE }}
          />
        </a>
      </div>
    </section>
  );
};

export default FooterLicenses;
