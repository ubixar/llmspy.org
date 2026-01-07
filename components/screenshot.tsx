'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ScreenshotProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt?: string
  href?: string
}

export function Screenshot({ src, alt, href, className, ...props }: ScreenshotProps) {
  const [isOpen, setIsOpen] = useState(false)

  const imgClasses = `rounded-lg hover:shadow border border-gray-200 dark:border-gray-700 ${className || ''}`

  const img = (
    <img
      src={src}
      alt={alt}
      className={imgClasses}
      {...props}
    />
  )

  // If href is provided, wrap in a link
  if (href) {
    const isExternal = href.startsWith('https://') || href.startsWith('http://')

    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="not-prose">
          {img}
        </a>
      )
    }

    return (
      <Link href={href} className="not-prose">
        {img}
      </Link>
    )
  }

  // Otherwise, make it clickable to open in a modal
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="not-prose cursor-zoom-in block"
        aria-label="Open image in full size"
      >
        {img}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-h-full max-w-full">
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
