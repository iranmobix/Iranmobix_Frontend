type CardTitles = {
  fa_title?: unknown;
  title_fa?: unknown;
  en_title?: unknown;
  title_en?: unknown;
  title?: unknown;
};

export function getProductCardTitle(titles: CardTitles): string {
  return [titles.fa_title, titles.title_fa, titles.en_title, titles.title_en, titles.title]
    .find((value): value is string => typeof value === "string" && Boolean(value.trim()))
    ?.trim() ?? "";
}
