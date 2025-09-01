import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Masterplan',
  description: 'Plano interactivo del barrio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased text-slate-900">{children}</body>
    </html>
  )
}
