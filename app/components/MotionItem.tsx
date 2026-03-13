// app/components/MotionItem.tsx
'use client';

import { motion, Variants } from 'framer-motion';

type MotionItemProps = {
  children: React.ReactNode;
  className?: string;
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 }, // يبدأ شفافًا ومتحركًا للأسفل
  visible: { 
    opacity: 1, 
    y: 0, // يعود إلى مكانه الأصلي
    transition: {
      type: 'spring', // تأثير "الزنبرك" لإحساس طبيعي
      stiffness: 100,
    }
  },
};

export default function MotionItem({ children, className }: MotionItemProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
