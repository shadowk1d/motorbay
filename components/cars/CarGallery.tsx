"use client";

import {useState} from "react";

type CarGalleryProps = {
  images: string[];
  alt: string;
  emptyLabel: string;
};

export default function CarGallery({images, alt, emptyLabel}: CarGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images.length) {
    return <div className="car-gallery-empty">{emptyLabel}</div>;
  }

  const currentImage = images[currentIndex];

  function prev() {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function next() {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className="car-gallery">
      <div className="car-gallery-main">
        <img src={currentImage} alt={alt} className="car-gallery-main-image" />

        {images.length > 1 && (
          <>
            <button type="button" className="car-gallery-arrow left" onClick={prev} aria-label="Previous image">
              ←
            </button>

            <button type="button" className="car-gallery-arrow right" onClick={next} aria-label="Next image">
              →
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="car-gallery-thumbs">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={index === currentIndex ? "car-gallery-thumb active" : "car-gallery-thumb"}
              onClick={() => setCurrentIndex(index)}
            >
              <img src={image} alt={`${alt} ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
