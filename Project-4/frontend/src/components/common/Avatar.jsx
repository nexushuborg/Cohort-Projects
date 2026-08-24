import React from 'react';

export const Avatar = ({ name = '', avatarUrl, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-16 h-16 text-xl font-bold',
  }[size] || 'w-8 h-8 text-sm';

  const initials = name ? name.slice(0, 2).toUpperCase() : 'U';

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${sizeClasses} rounded-full object-cover ring-2 ring-slate-800 ${className}`} />;
  }

  return (
    <div className={`${sizeClasses} bg-blue-600 rounded-full flex items-center justify-center font-medium text-white ring-2 ring-slate-800 shrink-0 ${className}`}>
      {initials}
    </div>
  );
};