import React from 'react';
import { Bitcoin, Coins, CircleDollarSign } from 'lucide-react';

interface Chain {
  name: string;
  icon: React.ReactNode;
}

interface ChainDisplayProps {
  title: string;
  chains: Chain[];
  accentColor: string;
}

const ChainDisplay: React.FC<ChainDisplayProps> = ({ title, chains, accentColor }) => (
  <div className="mt-8">
    <h2 className={`text-xl font-semibold mb-4 text-${accentColor}-700`}>{title}</h2>
    <div className="flex flex-wrap justify-center gap-6">
      {chains.map((chain) => (
        <div key={chain.name} className="flex flex-col items-center">
          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md">
            {chain.icon}
          </div>
          <span className="mt-2 text-sm font-medium text-gray-700">{chain.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ChainDisplay;

