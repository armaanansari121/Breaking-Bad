import React from 'react';

const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
    {children}
  </div>
);

export default GradientBackground;

