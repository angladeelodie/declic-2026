// app/components/LinkButton.tsx

import {Link} from 'react-router';
import ArrowSvg from '../assets/arrow.svg'; // adjust path as needed

type LinkButtonProps = {
  href: string;
  target?: string;
  text: string;
  loading?: 'eager' | 'lazy';
  onClick?: () => void;
  className?: string;
};

export function LinkButton({
  href,
  target,
  text,
  loading = 'lazy',
  onClick,
  className = '',
}: LinkButtonProps) {
  return (
    <Link
      to={href}
      target={target}
      rel={target === '_blank' ? 'noreferrer' : undefined}
      prefetch="intent"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 pt-8 pb-8
        group
        ${className}
      `}
    >
      <h4 className="m-0">{text}</h4>

      <img
        src={ArrowSvg}
        alt="arrow"
        loading={loading}
        className="
          w-4 h-4
          transition-transform duration-200 ease-out
          group-hover:translate-x-1
        "
      />
    </Link>
  );
}