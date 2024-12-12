import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TransactionInput: React.FC = () => {
  const [hash, setHash] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement trace logic
    console.log('Tracing hash:', hash);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Enter Transaction Hash to trace"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          className="flex-grow text-lg py-6"
        />
        <Button type="submit" className="w-full sm:w-auto text-lg py-6 px-8">
          Trace Transaction
        </Button>
      </div>
    </form>
  );
};

export default TransactionInput;

