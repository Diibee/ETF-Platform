interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  size?: 'sm' | 'xs';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  gray:   'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  red:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
};

export function Badge({ children, variant = 'gray', size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-md whitespace-nowrap flex-shrink-0 ${sizeClass} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
