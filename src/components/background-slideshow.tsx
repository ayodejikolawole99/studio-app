'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function BackgroundSlideshow() {
  const slideshowImages = PlaceHolderImages.filter(img => img.id.startsWith('staff-eating'));

  return (
    <div className="fixed inset-0 -z-10">
      {slideshowImages.map((image, index) => (
        <Image
          key={image.id}
          src={image.imageUrl}
          alt={image.description}
          fill
          priority={index === 0}
          className="object-cover opacity-0 slideshow-image"
          style={{ animationDelay: `${index * 5}s` }}
          data-ai-hint={image.imageHint}
        />
      ))}
      <div className="absolute inset-0 bg-black/50"></div>
    </div>
  );
}
