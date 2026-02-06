import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  // Handle Escape key and Body Scroll Lock
  useEffect(() => {
    if (!expanded) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // Lock scroll

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [expanded, close]);

  return (
    <div
      aria-modal
      role="dialog"
      className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
        expanded 
          ? 'opacity-100 visible pointer-events-auto' 
          : 'opacity-0 invisible pointer-events-none'
      }`}
    >
      {/* Background Overlay Fade */}
      <div 
        className="absolute inset-0 bg-black/20" 
        onClick={close} 
      />

      {/* Slide-in Panel */}
      <aside
        className={`fixed right-0 top-0 h-screen bg-white shadow-xl transition-transform duration-300 ease-in-out w-[min(var(--aside-width),100vw)] ${
          expanded ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between h-[var(--header-height)] px-5 border-b border-gray-100">
          <h3 className="text-sm font-black uppercase tracking-widest m-0">{heading}</h3>
          <button 
            className="text-3xl font-light leading-none hover:opacity-50 transition-opacity" 
            onClick={close} 
            aria-label="Close"
          >
            &times;
          </button>
        </header>
        <main className="p-5 overflow-y-auto h-[calc(100vh-var(--header-height))]">
          {children}
        </main>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}