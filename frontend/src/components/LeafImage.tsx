import React, { useState } from 'react';
import { Leaf } from 'lucide-react';

/** Leaf thumbnail with a graceful icon fallback when the file is missing (e.g. wiped server uploads). */
export const LeafImage: React.FC<{ src?: string; className?: string }> = ({ src, className = 'h-10 w-10' }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-white/15 dark:bg-white/10 dark:text-zinc-300 shrink-0`}>
        <Leaf className="h-1/2 w-1/2" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} rounded-lg object-cover border border-zinc-200 dark:border-white/15 shrink-0`}
    />
  );
};
