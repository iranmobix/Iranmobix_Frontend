import Image, { type StaticImageData } from "next/image";

export default function HeaderThemeIcon({ dark, light, width, height = width }: {
  dark: StaticImageData;
  light: StaticImageData;
  width: number;
  height?: number;
}) {
  return (
    <span aria-hidden="true" className="inline-grid shrink-0 place-items-center" style={{ width, height }}>
      <Image src={dark} alt="" width={width} height={height} data-header-icon="dark" />
      <Image src={light} alt="" width={width} height={height} data-header-icon="light" />
    </span>
  );
}
