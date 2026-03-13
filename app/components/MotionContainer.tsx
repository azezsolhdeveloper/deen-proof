// app/components/MotionContainer.tsx
'use client';

import { motion, Variants } from 'framer-motion';

type MotionContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // هذا هو السحر: تأخير 0.1 ثانية بين كل عنصر
    },
  },
};

export default function MotionContainer({ children, className }: MotionContainerProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible" // يبدأ التأثير عندما يدخل العنصر في مجال الرؤية
      viewport={{ once: true, amount: 0.2 }} // يعمل مرة واحدة فقط
    >
      {children}
    </motion.div>
  );
}
