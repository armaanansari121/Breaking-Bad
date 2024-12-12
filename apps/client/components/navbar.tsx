'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export function Navbar() {
  const [isMainnet, setIsMainnet] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-700">NCB's Eagle</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/main" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Transaction Tracing
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="network-switch"
                checked={isMainnet}
                onCheckedChange={setIsMainnet}
              />
              <Label htmlFor="network-switch">
                {isMainnet ? 'Mainnet' : 'Testnet'}
              </Label>
            </div>
            <Button variant="outline" className="mr-2">Sign In</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

