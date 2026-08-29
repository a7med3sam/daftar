'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PurchaseImage } from '@/lib/api';

interface Props {
  images: PurchaseImage[];
}

export default function ImageGallery({ images }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>لا توجد صور</span>;
  }

  return (
    <>
      <div className="image-grid">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.imageUrl}
            alt="صورة المنتج"
            className="thumb"
            onClick={() => setLightbox(img.imageUrl)}
          />
        ))}
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="صورة كاملة" className="lightbox-img" />
        </div>
      )}
    </>
  );
}
