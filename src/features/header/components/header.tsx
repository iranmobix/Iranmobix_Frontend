import { HeaderMobile } from "./header-mobile";
import { HeaderBottom } from "./header-bottom";
import { HeaderTop } from "./header-top";
import { HeaderCurrencyTicker } from "./header-currency-ticker";

export function Header() {
  return (
    <>
      <HeaderCurrencyTicker />
      <header className="sticky top-0 z-50 w-full bg-white/60 shadow-[0_1px_0_rgba(255,255,255,0.65),0_4px_24px_rgba(48,36,95,0.04)] backdrop-blur-[28px] backdrop-saturate-150">
        <HeaderMobile />
        <div className="mx-auto hidden max-w-[1440px] flex-col px-10 py-4 lg:flex">
          <HeaderTop />
          <HeaderBottom />
        </div>
      </header>
    </>
  );
}
