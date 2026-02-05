import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ThemeToggle({ 
  variant = 'ghost', 
  size = 'icon',
  className = '' 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`relative overflow-hidden transition-colors ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="relative z-10">
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-foreground transition-transform duration-300" />
        ) : (
          <Sun className="w-5 h-5 text-foreground transition-transform duration-300" />
        )}
      </span>
      <span 
        className={`absolute inset-0 rounded-md transition-opacity duration-300 ${
          theme === 'light' 
            ? 'bg-lime-500/10 opacity-100' 
            : 'bg-lime-500/10 opacity-0'
        }`}
      />
    </Button>
  );
}
