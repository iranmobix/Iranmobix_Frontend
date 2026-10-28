export type SocialLinks = {
  instagram?: string;
  telegram?: string;
  whatsapp?: string;
};

export type SiteConfig = {
  name: string;
  logo: string;
  phone: string;
  social: SocialLinks;
};

export const siteConfig: SiteConfig = {
  name: "IranMobix",
  logo: "/images/logo/nogb_nosub_logo.png",
  phone: "09136281348",
  social: {
    instagram: "#",
    telegram: "#",
    whatsapp: "#",
  },
};