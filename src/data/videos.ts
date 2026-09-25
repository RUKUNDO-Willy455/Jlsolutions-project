/**
 * VIDEO MAPPING — gallery videos of the team working on projects.
 * Drop video files into /public/videos, then add an entry below to show it
 * in the gallery. A poster (optional) can be any image path, e.g. a photo
 * from /public/images that shows what the video is about.
 */

const v = (file: string) => `/videos/${file}`;

export interface GalleryVideo {
  src: string;
  poster?: string;
}

/** All videos shown in the gallery. Add yours here, e.g.:
 * { src: v('cctv-install.mp4') },
 * { src: v('electrical-wiring.mp4'), poster: '/images/electrical-installation.jpeg' },
 */
export const ALL_VIDEOS: GalleryVideo[] = [
  { src: v('believer.mp4') },
  { src: v('billie-jean.mp4') },
];