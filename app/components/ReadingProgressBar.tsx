// app/components/ReadingProgressBar.tsx
'use client'; // <-- هذا السطر ضروري جدًا

import { motion, useScroll, useSpring } from 'framer-motion';

export default function ReadingProgressBar() {
  // 1. useScroll() يتتبع نسبة التمرير في الصفحة (من 0 إلى 1)
  const { scrollYProgress } = useScroll();

  // 2. useSpring() يجعل الحركة ناعمة وغير متقطعة
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100, // قوة النابض (spring)
    damping: 30,    // مقدار الاحتكاك (يمنع الاهتزاز)
    restDelta: 0.001
  });

  // 3. نستخدم motion.div من framer-motion لإنشاء العنصر المتحرك
  return (
    <motion.div 
className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-[0%] z-[9999]"
      style={{ scaleX: scaleX }} // نربط عرض الشريط بنسبة التمرير
    />
  );
}
