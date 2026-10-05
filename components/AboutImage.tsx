"use client";

interface Props {
  src: string;
  alt: string;
  icon: string;
}

export default function AboutImage({ src, alt, icon }: Props) {
  return (
    <div className="howto-media">
      <img
        src={src}
        alt={alt}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.nextElementSibling?.classList.remove("d-none");
        }}
      />
      <div className="howto-fallback howto-fallback--text d-none">
        <i className={`bi ${icon}`}></i>
        <small>{alt}</small>
      </div>
    </div>
  );
}
