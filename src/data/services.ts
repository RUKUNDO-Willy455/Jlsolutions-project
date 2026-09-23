import type { LucideIcon } from 'lucide-react';
import {
  Zap,
  Camera,
  Sun,
  Flame,
  Tv,
  Cpu,
  Volume2,
  Network,
  ShieldCheck,
  BatteryCharging,
  Wifi,
} from 'lucide-react';
import { IMAGES } from './images';

export interface ServicePrice {
  usd: number;
  rwf: number;
}

export interface Service {
  slug: string;
  title: string;
  short: string;
  icon: LucideIcon;
  description: string;
  points: string[];
  image: string;
  price: ServicePrice;
}

export function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

export function formatRwf(n: number): string {
  return `${n.toLocaleString('en-US')} RWF`;
}

export const SERVICES: Service[] = [
  {
    slug: 'electrical',
    title: 'Smart Electrical Installation',
    short: 'Smart Electrical',
    icon: Zap,
    description:
      'Professional electrical installation, wiring, distribution boards, lighting systems, protection systems and maintenance.',
    points: [
      'Electrical installation & wiring',
      'Distribution boards',
      'Lighting systems',
      'Protection systems',
      'Maintenance',
    ],
    image: IMAGES.electrical[0],
    price: { usd: 60, rwf: 75000 },
  },
  {
    slug: 'cctv',
    title: 'CCTV Camera Installation',
    short: 'CCTV Installation',
    icon: Camera,
    description:
      'Installation and configuration of CCTV surveillance systems designed to improve security and monitoring.',
    points: [
      'Camera installation',
      'System configuration',
      'Remote monitoring',
      'Security surveillance',
      'Maintenance',
    ],
    image: IMAGES.cctv[0],
    price: { usd: 35, rwf: 45000 },
  },
  {
    slug: 'solar',
    title: 'Solar System Installation',
    short: 'Solar Systems',
    icon: Sun,
    description:
      'Solar power solutions designed to provide efficient and sustainable energy for homes and businesses.',
    points: [
      'Solar panel installation',
      'Solar power systems',
      'System setup',
      'Maintenance',
    ],
    image: IMAGES.solar[0],
    price: { usd: 120, rwf: 155000 },
  },
  {
    slug: 'fire-detection',
    title: 'Fire Detector Systems',
    short: 'Fire Detection',
    icon: Flame,
    description:
      'Installation and maintenance of fire detection systems designed to provide early warning and improve safety.',
    points: [
      'Fire detectors',
      'Alarm systems',
      'Installation',
      'Maintenance',
    ],
    image: IMAGES.posters[0],
    price: { usd: 50, rwf: 65000 },
  },
  {
    slug: 'tv-mounting',
    title: 'TV Mounting',
    short: 'TV Mounting',
    icon: Tv,
    description:
      'Professional TV mounting for clean, secure and modern installations.',
    points: ['Wall mounting', 'Cable management', 'Positioning', 'Clean installation'],
    image: IMAGES.posters[1],
    price: { usd: 25, rwf: 32000 },
  },
  {
    slug: 'computer-maintenance',
    title: 'Computer Maintenance & Lab Installation',
    short: 'Computer Maintenance',
    icon: Cpu,
    description:
      'Computer repair, maintenance, software support and computer laboratory installation.',
    points: [
      'Computer maintenance',
      'Software installation',
      'Lab setup',
      'Network & equipment setup',
      'Troubleshooting',
    ],
    image: IMAGES.equipment[1],
    price: { usd: 30, rwf: 40000 },
  },
  {
    slug: 'sound-system',
    title: 'Sound System Installation',
    short: 'Sound Systems',
    icon: Volume2,
    description:
      'Professional sound system installation and configuration for homes, churches, businesses and other spaces.',
    points: [
      'Speaker installation',
      'Audio setup',
      'Sound system configuration',
      'Maintenance',
    ],
    image: IMAGES.equipment[0],
    price: { usd: 40, rwf: 50000 },
  },
  {
    slug: 'networking',
    title: 'Network / Smart Technology',
    short: 'Networking & Smart Tech',
    icon: Network,
    description:
      'Networking equipment, connectivity and smart technology installation for modern, connected spaces.',
    points: [
      'Networking equipment',
      'Routers & connectivity',
      'Smart technology installation',
      'System setup',
    ],
    image: IMAGES.equipment[0],
    price: { usd: 45, rwf: 58000 },
  },
];

export const FEATURED_CATEGORIES = [
  {
    title: 'Security',
    icon: ShieldCheck,
    items: ['CCTV', 'Fire Detection', 'Monitoring'],
    image: IMAGES.cctv[0],
  },
  {
    title: 'Energy',
    icon: BatteryCharging,
    items: ['Solar Systems', 'Electrical Installation', 'Energy Efficiency'],
    image: IMAGES.solar[0],
  },
  {
    title: 'Technology',
    icon: Wifi,
    items: ['Networking', 'Computer Maintenance', 'Smart Systems'],
    image: IMAGES.equipment[0],
  },
];