'use client'

import React, { useState } from 'react';
import GradientBackground from '@/components/GradientBackground';
import TransactionInput from '@/components/TransactionInput';
import ChainDisplay from '@/components/ChainDisplay';
import { Bitcoin, Coins, CircleDollarSign } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const testnetChains = [
  { name: 'Sepolia', icon: <Coins className="w-6 h-6 text-blue-600" /> },
  { name: 'Tron Nile', icon: <CircleDollarSign className="w-6 h-6 text-red-600" /> },
];

const mainnetChains = [
  { name: 'Ethereum', icon: <Coins className="w-6 h-6 text-blue-600" /> },
  { name: 'Tron', icon: <CircleDollarSign className="w-6 h-6 text-red-600" /> },
];

const upcomingChains = [
  { name: 'Bitcoin', icon: <Bitcoin className="w-6 h-6 text-orange-500" /> },
  { name: 'Solana', icon: <Coins className="w-6 h-6 text-purple-600" /> },
  { name: 'SUI', icon: <Coins className="w-6 h-6 text-blue-400" /> },
];

export default function MainPage() {
  const [isMainnet, setIsMainnet] = useState(false);

  return (
    <GradientBackground>
      <div className="container mx-auto px-4 py-12">
        <main className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">
            NCB's Eagle: Transaction Tracing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Enter a transaction hash to begin tracing across multiple blockchains.
          </p>

          <div className="flex justify-center items-center space-x-2 mb-6">
            <Switch
              id="network-switch"
              checked={isMainnet}
              onCheckedChange={setIsMainnet}
            />
            <Label htmlFor="network-switch">
              {isMainnet ? 'Mainnet' : 'Testnet'}
            </Label>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <TransactionInput />
          </div>

          <ChainDisplay 
            title={isMainnet ? "Supported Mainnet Chains" : "Supported Testnet Chains"}
            chains={isMainnet ? mainnetChains : testnetChains}
            accentColor="blue"
          />

          <ChainDisplay 
            title="Coming Soon" 
            chains={upcomingChains} 
            accentColor="yellow"
          />
        </main>
      </div>
    </GradientBackground>
  );
}

