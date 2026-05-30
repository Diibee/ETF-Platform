interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  size?: 'sm' | 'xs';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ children, variant = 'gray', size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-md whitespace-nowrap flex-shrink-0 ${sizeClass} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
