// app/components/Accordion.tsx
import {useState, type ReactNode} from 'react';

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
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-metalite text-emphasis font-bold">{title}</span>
        <span
          className={`flex flex-col items-center justify-center w-4 h-4 transition-transform duration-200 ${
            open ? 'rotate-45' : ''
          }`}
        >
          {/* Horizontal bar */}
          <span className="block h-[2px] w-4 bg-black" />
          {/* Vertical bar, centered under the horizontal bar */}
          <span className="block w-[2px] h-4 bg-black -mt-[8px]" />
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
