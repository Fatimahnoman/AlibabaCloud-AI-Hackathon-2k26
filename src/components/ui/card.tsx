import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, padding = 'md', children, className = '', ...props }, ref) => {
    const paddings = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    
    return (
      <div
        ref={ref}
        className={`bg-[#0f172a] rounded-xl shadow-sm border border-[#1e293b] ${paddings[padding]} ${
          hover ? 'hover:shadow-md hover:border-[#334155] transition-all cursor-pointer' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
export type { CardProps };
