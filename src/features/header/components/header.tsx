import { HeaderSurface } from "./header-surface";
import { HeaderMobile } from "./header-mobile";
import { HeaderBottom } from "./header-bottom";
import { HeaderTop } from "./header-top";
import { HeaderCurrencyTicker } from "./header-currency-ticker";

export function Header() {
  return (
    <HeaderSurface>
      <HeaderCurrencyTicker />
      <HeaderMobile />
      <div className="mx-auto hidden max-w-[1440px] flex-col px-6 py-4 lg:flex xl:px-10">
        <HeaderTop />
        <HeaderBottom />
      </div>
    </HeaderSurface>
  );
}
