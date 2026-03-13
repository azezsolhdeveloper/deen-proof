// data/doubts.ts (البنية النهائية الكاملة)

// واجهة المصدر (قابلة لإعادة الاستخدام)
export interface Source {
  text: string;
  url: string;
}

// واجهة الرد التفصيلي (لكل ادعاء)
export interface DetailedRebuttalItem {
  claim: string;
  response: string;
  sources: Source[]; // مصادر خاصة بهذا الرد
}

// الواجهة الرئيسية والنهائية للشبهة
export interface Doubt {
  id: string;
  category: 'quran' | 'prophet' | 'science' | 'history';
  title_ar: string;
  title_en: string;
  summary_ar: string;
  summary_en: string;
  quick_reply_ar: string;
  quick_reply_en: string;
  detailed_rebuttal_ar: DetailedRebuttalItem[];
  detailed_rebuttal_en: DetailedRebuttalItem[];
  main_sources_ar: Source[]; // مصادر عامة للمقال
  main_sources_en: Source[];
}

// مصفوفة البيانات الكاملة (مع ملء البيانات للشبهة الأولى كمثال)
export const doubts: Doubt[] = [
  {
    id: 'quran-preservation',
    category: 'quran',
    title_ar: 'هل تم تحريف القرآن؟',
    title_en: 'Has the Quran Been Altered?',
    summary_ar: 'تحليل تاريخي ومخطوطي يثبت حفظ القرآن عبر العصور، والرد على ادعاءات التغيير والحذف.',
    summary_en: 'A historical and manuscript analysis proving the preservation of the Quran throughout the ages.',
    quick_reply_ar: "القرآن الكريم محفوظ بحفظ الله تعالى، وتاريخ مخطوطاته، وتواتر قراءاته، وإجماع الأمة عليه يقطع أي شك في سلامته من التحريف. الفروقات المزعومة هي إما أخطاء نساخ تم تصحيحها أو اختلافات في اللهجات لا تمس جوهر النص.",
    quick_reply_en: "The Holy Quran is preserved by Allah Almighty. The history of its manuscripts, the mass transmission of its readings, and the consensus of the Muslim nation eliminate any doubt about its integrity. Alleged differences are either corrected scribal errors or dialectal variations that do not affect the core text.",
    detailed_rebuttal_ar: [
      {
        claim: "الادعاء الأول: وجود قراءات مختلفة يعني وجود نسخ مختلفة.",
        response: "القراءات المختلفة هي لهجات صوتية معتمدة ومتواترة نزلت على النبي ﷺ للتيسير على القبائل العربية، وهي لا تغير المعنى الأساسي بل تزيده ثراءً. كل القراءات محفوظة بالسند المتصل إلى النبي، وليست 'نسخًا' مختلفة من القرآن.",
        sources: [
          { text: "مناع القطان، 'مباحث في علوم القرآن'، فصل نزول القرآن على سبعة أحرف.", url: "#" },
          { text: "ابن الجزري، 'النشر في القراءات العشر'.", url: "#" }
        ]
      },
      {
        claim: "الادعاء الثاني: مخطوطات صنعاء أثبتت وجود اختلافات.",
        response: "الدراسات الأكاديمية على مخطوطات صنعاء، بما فيها دراسات الباحثين الغربيين أنفسهم، أثبتت أن الفروقات هي أخطاء نساخ تم تصحيحها، أو اختلافات طفيفة جدًا لا تؤثر على المعنى وتتوافق مع ما هو معروف في علم الرسم القرآني. لم يتم العثور على آية واحدة محذوفة أو مضافة.",
        sources: [
          { text: "Behnam Sadeghi & Mohsen Goudarzi, 'Sana'a 1 and the Origins of the Qur'an'.", url: "#" },
          { text: "د. محمد مصطفى الأعظمي، 'تاريخ النص القرآني'.", url: "#" }
        ]
      }
    ],
    detailed_rebuttal_en: [ /* English version of detailed rebuttal */ ],
    main_sources_ar: [
      { text: "الموقع الرسمي لمجمع الملك فهد لطباعة المصحف الشريف.", url: "#" },
      { text: "موسوعة علوم القرآن على موقع إسلام ويب.", url: "#" }
    ],
    main_sources_en: [ /* English version of main sources */ ]
  },
  // ... باقي الشبهات مع بيانات فارغة لتجنب الأخطاء
  {
    id: 'quran-scientific-errors',
    category: 'quran',
    title_ar: 'هل يحتوي القرآن على أخطاء علمية؟',
    title_en: 'Does the Quran Contain Scientific Errors?',
    summary_ar: 'مناقشة الآيات التي يُدَّعى تعارضها مع العلم الحديث، وتوضيح التوافق بينها وبين الحقائق المثبتة.',
    summary_en: 'Discussing verses claimed to conflict with modern science and clarifying their harmony with established facts.',
    quick_reply_ar: "",
    quick_reply_en: "",
    detailed_rebuttal_ar: [],
    detailed_rebuttal_en: [],
    main_sources_ar: [],
    main_sources_en: []
  },
  {
    id: 'prophet-marriage-aisha',
    category: 'prophet',
    title_ar: 'شبهة زواج النبي ﷺ من عائشة',
    title_en: 'The Prophet\'s Marriage to Aisha',
    summary_ar: 'دراسة السياق التاريخي والثقافي والاجتماعي لزواج النبي ﷺ من السيدة عائشة رضي الله عنها.',
    summary_en: 'A study of the historical, cultural, and social context of the Prophet\'s marriage to Aisha.',
    quick_reply_ar: "",
    quick_reply_en: "",
    detailed_rebuttal_ar: [],
    detailed_rebuttal_en: [],
    main_sources_ar: [],
    main_sources_en: []
  }
];
