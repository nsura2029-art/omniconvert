import React from 'react';

interface Props {
  emoji: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

const CategoryIcon: React.FC<Props> = ({ emoji, size = 'md', className = '' }) => (
  <span
    className={`inline-flex items-center justify-center leading-none ${SIZE[size]} ${className}`}
    aria-hidden="true"
  >
    {emoji}
  </span>
);

export default CategoryIcon;