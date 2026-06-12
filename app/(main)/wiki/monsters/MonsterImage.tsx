'use client'

import { useState } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
}

export default function MonsterImage({ src, alt, className }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(false)

  if (error) return null

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-pointer hover:opacity-80 transition-opacity`}
        onError={() => setError(true)}
        onClick={() => setOpen(true)}
      />

      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:text-white flex items-center justify-center text-sm"
            >
              ✕
            </button>
            <p className="text-center text-slate-400 text-sm mt-2">{alt}</p>
          </div>
        </div>
      )}
    </>
  )
}
