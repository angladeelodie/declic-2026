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
      className={`inline-flex items-center gap-2 pt-0 pb-8 group ${className}`}
    >
      {/* Wrap the text to control its line-box height precisely */}
      <div className="flex items-center h-full">
        <h4 className="m-0 leading-[1.1] flex items-center">{text}</h4>
      </div>

      <img
        src={ArrowSvg}
        alt="arrow"
        loading={loading}
        className="
      block
      w-5 h-auto
      transition-transform duration-200 ease-out
      group-hover:translate-x-1
      /* Remove 'top-[1.5px]' and use a tiny vertical translate instead */
      /* This nudge is usually subtler across engines */
      translate-y-[0.5px]
    "
      />
    </Link>
  );
}
