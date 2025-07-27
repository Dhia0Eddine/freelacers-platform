import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const isRTL = i18n.language === 'ar';

  const footerLinks = [
    {
      title: t('footer_for_clients'),
      links: [
        { name: t('footer_find_freelancers'), href: '/find-freelancers' },
        { name: t('footer_post_project'), href: '/post-project' },
        { name: t('footer_pricing'), href: '/pricing' },
        { name: t('footer_client_resources'), href: '/client-resources' },
      ]
    },
    {
      title: t('footer_for_freelancers'),
      links: [
        { name: t('footer_find_work'), href: '/find-work' },
        { name: t('footer_create_profile'), href: '/create-profile' },
        { name: t('footer_success_stories'), href: '/success-stories' },
        { name: t('footer_freelancer_resources'), href: '/freelancer-resources' },
      ]
    },
    {
      title: t('footer_company'),
      links: [
        { name: t('footer_about_us'), href: '/about' },
        { name: t('footer_careers'), href: '/careers' },
        { name: t('footer_blog'), href: '/blog' },
        { name: t('footer_press'), href: '/press' },
      ]
    },
    {
      title: t('footer_support'),
      links: [
        { name: t('footer_help_center'), href: '/help' },
        { name: t('footer_contact_us'), href: '/contact' },
        { name: t('footer_privacy_policy'), href: '/privacy' },
        { name: t('footer_terms_of_service'), href: '/terms' },
      ]
    },
  ];

  return (
    <footer
      className={`bg-black-100 dark:bg-gray-900 text-black-800 dark:text-gray-300 transition-colors duration-500 ${isRTL ? 'font-arabic' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Top section with logo and subscribe */}
        <div className={`flex flex-col md:flex-row justify-between mb-12 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={`mb-8 md:mb-0 ${isRTL ? 'md:text-right' : ''}`}>
            <div className="text-2xl font-bold text-black-900 dark:text-white mb-4">{t('footer_platform_name')}</div>
            <p className="max-w-xs text-black-600 dark:text-gray-400">
              {t('footer_connecting_talent')}
            </p>
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t('footer_subscribe_newsletter')}</h3>
            <div className="flex">
              <input
                type="email"
                placeholder={t('footer_enter_email')}
                className={`bg-white dark:bg-gray-800 text-black-900 dark:text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow ${isRTL ? 'rounded-l-none rounded-r-md' : ''}`}
                style={isRTL ? { textAlign: 'right' } : {}}
              />
              <button className={`bg-indigo-600 hover:bg-indigo-700 text-black-900 px-4 py-2 rounded-r-md transition-colors ${isRTL ? 'rounded-r-none rounded-l-md' : ''}`}>
                {t('footer_subscribe')}
              </button>
            </div>
          </div>
        </div>

        {/* Middle section with links */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-b border-gray-200 dark:border-gray-800 ${isRTL ? 'text-right' : ''}`}>
          {footerLinks.map((column, i) => (
            <div key={i}>
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      to={link.href}
                      className="text-black-400 hover:text-indigo-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section with social links and copyright */}
        <div className={`pt-8 flex flex-col md:flex-row justify-between items-center ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={`flex space-x-4 mb-4 md:mb-0 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
          <div className="text-black-500 text-sm">
            {t('footer_copyright').replace('2025', currentYear.toString())}
          </div>
        </div>
      </div>
    </footer>
  );
}
