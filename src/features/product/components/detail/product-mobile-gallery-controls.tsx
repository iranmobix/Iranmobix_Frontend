import ProductDetailActions from "./product-detail-actions";
import ProductDetailSource from "./product-detail-source";

type Props = { slug?: string; title?: string; source: string; url: string };

export default function ProductMobileGalleryControls({ slug, title, source, url }: Props) {
  return (
    <>
      <div className="absolute top-3 left-3 z-20 lg:hidden">
        <ProductDetailActions slug={slug} title={title} glass />
      </div>
      {url && (
        <div className="absolute top-3 right-3 z-20 lg:hidden">
          <ProductDetailSource source={source} url={url} glass />
        </div>
      )}
    </>
  );
}
