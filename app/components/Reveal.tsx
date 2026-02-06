import { motion } from 'framer-motion';

export function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 70 }} // Starts invisible and 30px down
      whileInView={{ opacity: 1, y: 0 }} // Animates to normal when seen
      viewport={{ 
        once: true,      // Only animate once (prevents re-triggering when scrolling up)
        margin: "-10%"   // Triggers when the element is 10% into the screen
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.21, 0.6, 0.35, 1] // A smooth, luxury-feel easing
      }}
    >
      {children}
    </motion.div>
  );
}