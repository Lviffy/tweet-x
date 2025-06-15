
import React, { useState } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <div className="p-8 text-red-600 text-center">
        <h2>Something went wrong while loading the Tweet Generator page.</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (err) {
    setError(err as Error);
    return null;
  }
}
