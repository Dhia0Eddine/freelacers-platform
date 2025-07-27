import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Briefcase, Globe, TrendingUp, ClipboardList, Search, Newspaper, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

// Bilingual content object
const aboutContent = {
  en: {
    heading: "About Us",
    intro: "Welcome to Freelance Hub, a platform built to connect people with skilled professionals — fast, easy, and trusted.",
    mission: "From home repairs and tech support to tutoring and more, we make it simple to post your request and reach ready professionals. With thousands of completed projects, we help people get things done and support local talent and small businesses.",
    audience: [
      {
        icon: <UserCheck className="h-5 w-5" />,
        title: "Customers",
        desc: "Need something done? Post a request, get multiple quotes, compare, and hire the right expert — all in one place.",
        testimonial: {
          text: "I was overwhelmed trying to fix everything myself. This platform gave me access to real help within hours.",
          author: "Lina, customer"
        }
      },
      {
        icon: <Briefcase className="h-5 w-5" />,
        title: "Freelancers & Pros",
        desc: "Grow your business and start offering your services flexibly. Showcase your skills to customers searching for your expertise — locally or remotely.",
        testimonial: {
          text: "I've doubled my client base in just three months. This platform changed how I get projects.",
          author: "Andre, web developer"
        }
      },
      {
        icon: <Globe className="h-5 w-5" />,
        title: "Communities",
        desc: "We're more than a marketplace — we're a movement. With every request, every connection, and every skill shared, we strengthen communities through collaboration.",
        testimonial: {
          text: "Helping people in my city while growing my business — an unmatched experience.",
          author: "Fatima, home cleaner"
        }
      }
    ],
    stats: [
      { value: "$X million+", label: "in projects facilitated" },
      { value: "500+", label: "service categories" },
      { value: "Thousands", label: "freelancers and pros" },
      { value: "Millions", label: "requests posted" },
      { value: "Nationwide", label: "service availability" },
      { value: "95%+", label: "customer satisfaction" }
    ],
    links: [
      { to: "/how-it-works", icon: <Search className="h-5 w-5" />, label: "How it works" },
      { to: "/careers", icon: <Briefcase className="h-5 w-5" />, label: "Careers" },
      { to: "/press", icon: <Newspaper className="h-5 w-5" />, label: "Press" }
    ]
  },
  ar: {
    heading: "من نحن",
    intro: "مرحبًا بك في Freelance Hub، منصة مصممة لربط الأشخاص بالمحترفين الماهرين بسرعة وسهولة وموثوقية.",
    mission: "سواء كنت بحاجة إلى تصليحات منزلية، دعم تقني، دروس خصوصية، أو خدمات أخرى، نوفر لك طريقة بسيطة لنشر طلبك والوصول إلى محترفين جاهزين للعمل. ومع آلاف المشاريع المنجزة، نساعد الناس في إنجاز مهامهم اليومية، وندعم في الوقت نفسه الكفاءات المحلية والمشاريع الصغيرة.",
    audience: [
      {
        icon: <UserCheck className="h-5 w-5" />,
        title: "العملاء",
        desc: "هل لديك مهمة وتحتاج إلى من ينفذها؟ انشر طلبك، استقبل عروض أسعار متعددة، قارن بينها، واختر الأنسب — كل ذلك في مكان واحد.",
        testimonial: {
          text: "كنت أشعر بالإرهاق وأنا أحاول إصلاح كل شيء بنفسي. هذه المنصة وفرت لي المساعدة الحقيقية خلال ساعات.",
          author: "لينا، عميلة"
        }
      },
      {
        icon: <Briefcase className="h-5 w-5" />,
        title: "المستقلون والمحترفون",
        desc: "نمِّ عملك وابدأ في تقديم خدماتك بمرونة. اعرض مهاراتك على العملاء الذين يبحثون عن خدماتك — محليًا أو عن بُعد.",
        testimonial: {
          text: "ضاعفت عدد عملائي خلال ثلاثة أشهر فقط. هذه المنصة غيّرت طريقة حصولي على المشاريع.",
          author: "أندري، مطوّر مواقع"
        }
      },
      {
        icon: <Globe className="h-5 w-5" />,
        title: "المجتمعات",
        desc: "لسنا مجرد سوق خدمات، بل حركة تهدف إلى بناء روابط أقوى. مع كل طلب، وكل تواصل، وكل مهارة يتم مشاركتها، نُسهم في تقوية المجتمعات بالتعاون والعمل المشترك.",
        testimonial: {
          text: "مساعدة الناس في مدينتي وتنمية مشروعي في نفس الوقت — تجربة لا تُضاهى.",
          author: "فاطمة، عاملة تنظيف منازل"
        }
      }
    ],
    stats: [
      { value: "+X مليون دولار", label: "قيمة المشاريع المنفذة" },
      { value: "+500", label: "فئة خدمة متاحة" },
      { value: "آلاف", label: "المستقلين والمحترفين" },
      { value: "ملايين", label: "الطلبات المنشورة" },
      { value: "تغطية", label: "على مستوى الوطن" },
      { value: "+95٪", label: "رضا العملاء" }
    ],
    links: [
      { to: "/how-it-works", icon: <Search className="h-5 w-5" />, label: "كيف تعمل المنصة" },
      { to: "/careers", icon: <Briefcase className="h-5 w-5" />, label: "الوظائف" },
      { to: "/press", icon: <Newspaper className="h-5 w-5" />, label: "الأخبار والبيانات الصحفية" }
    ]
  }
};

export default function AboutPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === "ar" ? "ar" : "en";
  const content = aboutContent[lang];
  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [isRTL]);

  return (
    <div 
      className={`bg-white dark:bg-gray-900 min-h-screen py-16 px-4 ${isRTL ? 'font-arabic' : ''}`} 
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`mb-10 text-center ${isRTL ? 'text-center' : ''}`}>
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-blue-700 dark:text-blue-300 font-semibold text-lg">
              {content.heading}
            </span>
          </div>
          <h1 className={`text-4xl font-bold text-gray-900 dark:text-white mb-4 ${isRTL ? 'text-center' : 'text-center'}`}>
            {isRTL ? "منصة" : "We're"} <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">Freelance Hub</span>
          </h1>
          <p className={`text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto ${isRTL ? 'text-center' : 'text-center'}`}>
            {content.intro}
          </p>
        </div>

        {/* Mission */}
        <div className={`mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-xl text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
            {content.mission}
          </p>
        </div>

        {/* Who We Serve */}
        <div className="mb-16">
          <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 ${
            isRTL ? 'justify-end flex-row-reverse' : 'justify-start'
          }`}>
            <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            {isRTL ? "من نخدم؟" : "Who We Serve"}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {content.audience.map((aud, idx) => (
              <div 
                key={idx} 
                className={`rounded-xl p-6 ${
                  idx === 0 ? "bg-blue-50 dark:bg-blue-900/20" : 
                  idx === 1 ? "bg-purple-50 dark:bg-purple-900/20" : 
                  "bg-green-50 dark:bg-green-900/20"
                } ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
                  isRTL ? 'justify-end flex-row-reverse' : 'justify-start'
                } ${
                  idx === 0 ? "text-blue-700 dark:text-blue-300" : 
                  idx === 1 ? "text-purple-700 dark:text-purple-300" : 
                  "text-green-700 dark:text-green-300"
                }`}>
                  {aud.icon}
                  <span>{aud.title}</span>
                </h3>
                <p className={`mb-4 text-sm text-gray-700 dark:text-gray-200 leading-relaxed ${
                  isRTL ? 'text-right' : 'text-left'
                }`}>
                  {aud.desc}
                </p>
                <blockquote className={`italic text-sm ${
                  isRTL 
                    ? 'border-r-4 border-blue-400 pr-3 text-right' 
                    : 'border-l-4 border-blue-400 pl-3 text-left'
                } text-gray-600 dark:text-gray-400`}>
                  <span className="block mb-1">"{aud.testimonial.text}"</span>
                  <span className="not-italic font-medium text-gray-800 dark:text-gray-200 text-xs">
                    — {aud.testimonial.author}
                  </span>
                </blockquote>
              </div>
            ))}
          </div>
        </div>

        {/* By the Numbers */}
        <div className="mb-16">
          <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 ${
            isRTL ? 'justify-end flex-row-reverse' : 'justify-start'
          }`}>
            <TrendingUp className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            {isRTL ? "بالأرقام" : "By the Numbers"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {content.stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className={`text-3xl font-bold mb-1 ${
                  idx === 0 ? "text-blue-600 dark:text-blue-400" : 
                  idx === 1 ? "text-indigo-600 dark:text-indigo-400" : 
                  idx === 2 ? "text-purple-600 dark:text-purple-400" : 
                  idx === 3 ? "text-green-600 dark:text-green-400" : 
                  idx === 4 ? "text-blue-600 dark:text-blue-400" : 
                  "text-yellow-500 dark:text-yellow-300"
                }`}>
                  {stat.value}
                </span>
                <span className={`text-gray-700 dark:text-gray-300 text-sm ${
                  isRTL ? 'text-center' : 'text-center'
                }`}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Useful Links */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 ${
            isRTL ? 'justify-end flex-row-reverse' : 'justify-start'
          }`}>
            <ClipboardList className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            {isRTL ? "روابط مفيدة" : "Learn More"}
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            {content.links.map((link, idx) => (
              <Link to={link.to} className="flex-1" key={idx}>
                <Button className={`w-full flex items-center gap-2 justify-center text-lg py-4 ${
                  isRTL ? 'flex-row-reverse' : ''
                } ${
                  idx === 0 ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : 
                  idx === 1 ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white" : 
                  "bg-gradient-to-r from-gray-700 to-gray-900 text-white"
                }`}>
                  {link.icon}
                  <span>{link.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}