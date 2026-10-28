import { siteConfig } from "@/lib/site-config";

export async function getSiteConfig() {
  // later: replace with Django API call
  return siteConfig;
}