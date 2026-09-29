// Seed data for the Jean Luc Solutions database.
// Mirrors src/data/editor.ts so the DB boots with the same content the app used
// to ship in localStorage.

export const seedTechnicians = [
  { id: 'jean', name: 'Jean Luc Habimana', role: 'Lead CCTV Specialist', available: true, phone: '+250 788 100 001', email: 'jlhabimana@jeanlucsolutions.rw', username: 'jluc.habimana', password: 'jluc@2024', photoUrl: '' },
  { id: 'eric', name: 'Eric Nkurunziza', role: 'PCB & Electronics Expert', available: true, phone: '+250 788 100 002', email: 'enkurunziza@jeanlucsolutions.rw', username: 'eric.nkur', password: 'eric@2024', photoUrl: '' },
  { id: 'alice', name: 'Alice Uwimana', role: 'Network Systems Engineer', available: false, phone: '+250 788 100 003', email: 'auwimana@jeanlucsolutions.rw', username: 'alice.uw', password: 'alice@2024', photoUrl: '' },
  { id: 'patrick', name: 'Patrick Bizimana', role: 'Access Control Specialist', available: true, phone: '+250 788 100 004', email: 'pbizimana@jeanlucsolutions.rw', username: 'patrick.b', password: 'patrick@2024', photoUrl: '' },
  { id: 'claudine', name: 'Claudine Mukamana', role: 'Senior Diagnostics Tech', available: true, phone: '+250 788 100 005', email: 'cmukamana@jeanlucsolutions.rw', username: 'claudine.m', password: 'claudine@2024', photoUrl: '' },
];

// Intentionally empty. The site must not ship fabricated bookings: real ones
// arrive from the public booking form and the admin portal, and the first
// real booking is minted as JL001.
export const seedBookings = [];

export const seedFounder = {
  name: 'Jean Luc Niyibizi',
  title: 'CEO & Founder',
  tagline: 'Passionate technologist building Rwanda\'s most trusted electronics & security brand.',
  bio: 'Jean Luc Niyibizi founded Jean Luc Solutions in 2008 with a single mission: to bring world-class technical expertise to Rwandan businesses and homes. Starting as a one-man CCTV installer in Kigali, he grew the company into a full-spectrum electronics services firm with a team of certified technicians, and a reputation for zero-compromise craftsmanship.\n\nJean Luc holds advanced certifications in IP camera systems, structured cabling, and access control. He is a regular speaker at technology forums across East Africa and a strong advocate for skills development among Rwandan youth.',
  email: 'jeanluc@jeanlucsolutions.rw',
  phone: '+250 788 100 000',
  linkedin: 'https://linkedin.com/in/jeanlucniyibizi',
  twitter: '',
  photoUrl: '',
  yearsExperience: '15+',
  vision: 'To make reliable, professional-grade electronic security and repair services accessible to every business and household across Rwanda and East Africa.',
  degrees: [
    { id: 'd1', title: 'BSc (Hons) Electrical & Electronics Engineering', institution: 'University of Rwanda — College of Science & Technology', year: '2011' },
    { id: 'd2', title: 'Certified CCTV & IP Surveillance Specialist', institution: 'Hikvision DSPP Academy', year: '2015' },
    { id: 'd3', title: 'CCNA — Cisco Certified Network Associate', institution: 'Cisco Networking Academy', year: '2018' },
    { id: 'd4', title: 'Fiber Optic Installation & Splicing Certification', institution: 'Rwanda Standards Board (RSB)', year: '2016' },
  ],
  achievements: [
    'CCTV & access control installations across homes, offices and institutions in Rwanda',
    'Certified IP Camera & Network Security Specialist',
    'Awarded Top SME in Technology Services — Kigali 2023',
    'Trainer of 40+ young technicians through the JL Skills Programme',
  ],
};

export const seedTestimonials = [
  { id: 't1', name: 'Emmanuel Nkurunziza', title: 'Head of Security Operations', company: 'Bank of Kigali', quote: 'Jean Luc Solutions installed a 48-camera IP surveillance network across our three Kigali branches in under a week. The image quality and uptime have been flawless for two years.', rating: 5, project: 'IP CCTV — 48 Cameras', year: '2024', visible: true },
  { id: 't2', name: 'Aline Uwimana', title: 'IT Infrastructure Manager', company: 'Rwanda Revenue Authority', quote: "Jean Luc's PCB team recovered two dead server boards. That saved us over RWF 4 million in replacement costs. Exceptional diagnostics.", rating: 5, project: 'PCB Recovery — 3 Boards', year: '2023', visible: true },
  { id: 't3', name: 'Patrick Hakizimana', title: 'Facilities Director', company: 'Kigali Convention Centre', quote: 'The access control upgrade at KCC was seamless. Professional from survey to sign-off.', rating: 5, project: 'Access Control — 12 Doors', year: '2024', visible: true },
];