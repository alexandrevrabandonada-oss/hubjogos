import { ElementType, ReactNode } from 'react';

interface ShellContainerProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function ShellContainer({
  as: Component = 'div',
  children,
  className,
}: ShellContainerProps) {
  return <Component className={['container', className || ''].join(' ')}>{children}</Component>;
}
