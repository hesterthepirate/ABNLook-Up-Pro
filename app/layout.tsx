import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ABNLookupPro',
  description: 'Australian Business Number lookup',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-gray-900 text-white py-4 px-6 shadow-md">
          <h1 className="text-xl font-bold tracking-tight">ABNLookupPro</h1>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
