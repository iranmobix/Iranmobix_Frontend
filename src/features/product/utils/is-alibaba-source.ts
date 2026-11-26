export function isAlibabaSource(source: string, url: string): boolean {
  const namedAlibaba = /^(alibaba(?:\.com)?|علی\s?بابا)$/i.test(source.trim());
  try {
    const host = new URL(url).hostname;
    return namedAlibaba || host === "alibaba.com" || host.endsWith(".alibaba.com");
  } catch {
    return namedAlibaba;
  }
}
