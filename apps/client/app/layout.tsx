import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'
import Header from "@/components/Header";
import { Web3AuthProvider } from "./webauthprovider";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "NCB's Eagle",
  description: 'Advanced Cryptocurrency Transaction Tracing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(inter.className, 'antialiased')}>
      <body>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Header />
        <main className='flex-grow'>
          <Web3AuthProvider>{children}</Web3AuthProvider>
        </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}

