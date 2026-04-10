import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ABNLookupPro — Fast Australian Business Number Search",
  description:
    "Search any Australian Business Number instantly. Cleaner results than the ABR, no BS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-white text-slate-900`}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-lg font-bold tracking-tight">
                <span className="text-blue-600">ABNLookup</span>
                <span className="text-slate-900">Pro</span>
              </span>
            </a>
            <nav className="flex items-center gap-1">
              <a
                href="https://nononah.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-50"
              >
                By NoNoNah
              </a>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-400">
            <span>
              &copy; {new Date().getFullYear()}{" "}
              <a
                href="https://nononah.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-blue-600"
              >
                NoNoNah
              </a>
              . All rights reserved.
            </span>
            <span className="text-xs">
              ABN data sourced from the Australian Business Register
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
