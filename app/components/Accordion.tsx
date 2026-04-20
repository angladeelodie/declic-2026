// app/components/Accordion.tsx
import {useState, type ReactNode} from 'react';
import ArrowSvg from '../assets/arrow.svg'; // adjust path as needed

type AccordionItemProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
   <div className="">
  <button
    type="button"
    onClick={() => setOpen((prev) => !prev)}
    className="group flex w-full items-center justify-between py-4 text-left"
  >
    <span className="font-bold">{title}</span>
    <span
      className={`flex flex-col items-center justify-center w-4 h-4 transition-transform duration-200 ${
        /* Changed to -90 for opposite rotation. Use 180 if you want a flip */
        open ? '-rotate-90' : ''
      }`}
    >
      <img
        src={ArrowSvg}
        alt="arrow"
        className="w-4 h-4 transition-transform duration-200 ease-out 
        /* Ensure translate-x is positive if you want it to move right, 
           or keep it negative to move left */
        group-hover:translate-x-1"
      />
    </span>
  </button>

  <div
    className={`grid transition-[grid-template-rows,opacity] duration-200 ${
      open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
    }`}
  >
    <div className="overflow-hidden pb-4">{children}</div>
  </div>
</div>
  );
}

type AccordionProps = {
  children: ReactNode;
  className?: string;
};

export function Accordion({children, className = ''}: AccordionProps) {
  return <div className={`w-full ${className}`}>{children}</div>;
}
