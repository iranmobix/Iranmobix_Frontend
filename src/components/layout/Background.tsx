import Image from "next/image";

export default function Background() {
  return (
    // Fallback for first load
    <div className="fixed inset-0 z-0 w-full h-full pointer-events-none bg-[#F8F6FA] dark:bg-[#181024] transition-colors duration-300">
      {/* Light Mode Image */}
      <Image
        src="/images/background/bg-light.webp"
        alt="IranMobix Light Background"
        fill
        priority
        quality={65}
        sizes="100vw"
        className="object-cover block dark:hidden opacity-80"
      />

      {/* Dark Mode Image */}
      <Image
        src="/images/background/bg-dark.webp"
        alt="IranMobix Dark Background"
        fill
        priority
        quality={65}
        sizes="100vw"
        className="object-cover hidden dark:block opacity-60"
      />

      {/* Noise Layer */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      ></div>
    </div>
  );
}
