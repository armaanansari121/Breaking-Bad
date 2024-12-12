'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthModal() {
  const [isSignIn, setIsSignIn] = useState(true)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{isSignIn ? 'Sign In' : 'Sign Up'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignIn ? 'Sign In' : 'Sign Up'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isSignIn && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" className="col-span-3" />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input id="password" type="password" className="col-span-3" />
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setIsSignIn(!isSignIn)}>
            {isSignIn ? 'Need an account?' : 'Already have an account?'}
          </Button>
          <Button type="submit">{isSignIn ? 'Sign In' : 'Sign Up'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

