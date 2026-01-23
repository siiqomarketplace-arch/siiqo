import React from "react";
import Image, { ImageProps as NextImageProps } from "next/image";

type AppImageProps = Omit<NextImageProps, "src" | "alt"> & {
  src?: string | null; // ⬅️ make it optional
  alt?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

const AppImage: React.FC<AppImageProps> = ({
  src,
  alt = "Image Name",
  className = "",
  fill,
  width = 100,
  height = 100,
  ...props
}) => {
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const imgElement = e.target as HTMLImageElement;
    imgElement.src = "/assets/images/no_image.png";
  };

  // ✅ fallback if src is missing/empty
  const safeSrc =
    src && src.trim() !== "" ? src : "/assets/images/no_image.png";

  // ✅ When using fill, don't pass width/height
  if (fill) {
    return (
      <Image
        src={safeSrc}
        alt={alt}
        className={className}
        onError={handleImageError}
        fill
        {...props}
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      width={width}
      height={height}
      {...props}
    />
  );
};

export default AppImage;
