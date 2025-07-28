import React, { useState } from 'react';
import en from './en.json';
import ar from './ar.json';

const translations = { en, ar };

function ProfilePage() {
  // Example: get language from localStorage or default to 'en'
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const t = translations[lang];

  return (
    <div>
      <h1>{t['profile.title']}</h1>
      <p>{t['profile.description']}</p>
      {/* ...other profile fields using t['key']... */}
      {/* Example language switcher: */}
      <button onClick={() => { setLang('en'); localStorage.setItem('lang', 'en'); }}>English</button>
      <button onClick={() => { setLang('ar'); localStorage.setItem('lang', 'ar'); }}>العربية</button>
    </div>
  );
}

export default ProfilePage;