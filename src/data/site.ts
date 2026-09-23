/** Central company information. Edit once, updates everywhere. */
export const SITE = {
  name: 'Jean Luc Solutions',
  shortName: 'Jean Luc',
  legalName: 'Jean Luc Solutions',
  motto: 'Skills • Speed • Sustainability',
  mottoParts: ['Skills', 'Speed', 'Sustainability'],
  tagline: 'Powering Your World. Securing Your Space.',
  heroLabel: 'SMART TECHNICAL SOLUTIONS',
  heroLead:
    'Professional technology, electrical and security solutions designed for homes, businesses and modern spaces.',
  summary:
    'Jean Luc Solutions provides professional technical installation, maintenance and technology solutions designed to improve safety, comfort, connectivity and efficiency. The company combines practical technical skills with modern solutions to serve homes, businesses and other professional environments.',
  phone: '0789682414',
  phoneAlt: '0724238710',
  email: 'niwemimi99@gmail.com',
  whatsappNumber: '250789682414',
  whatsappDisplay: '0789682414',
  quickMessage: 'Hello Jean Luc Solutions, I would like to request a service.',
} as const;

export const PHONE_LINKS = {
  primary: `tel:${SITE.phone}`,
  alt: `tel:${SITE.phoneAlt}`,
  whatsapp: `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.quickMessage)}`,
  mail: `mailto:${SITE.email}`,
} as const;

/** "Having an issue?" — opens the visitor's email client with a ready-made message sent to the company email. */
export const SUPPORT_MESSAGE =
  'Describe the issue you are facing (or the question you have):\n\n- What were you doing?\n- What did you expect to happen?\n- What happened instead?\n- Any screenshots / details that could help us help you faster.';
export const SUPPORT_MAIL_LINK = `mailto:${SITE.email}?subject=${encodeURIComponent('Website Support — Question / Issue Report')}&body=${encodeURIComponent(SUPPORT_MESSAGE)}`;

/** Social media profiles. Placeholders — replace with the real handles/profiles. */
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/jeanlucsolutions',
  linkedin: 'https://www.linkedin.com/company/jeanluc-solutions',
  x: 'https://x.com/jeanlucsolutions',
  facebook: 'https://www.facebook.com/jeanlucsolutions',
} as const;