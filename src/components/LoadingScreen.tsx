import BrandLogo from './BrandLogo';
import { SERVICES } from '../data/services';
import { useI18n } from '../i18n';
import './LoadingScreen.css';

interface Props {
  /** When false the splash fades out before unmounting. */
  visible: boolean;
}

const VEINS = [
  { x: '6%', d: '0s' },
  { x: '20%', d: '1.1s' },
  { x: '34%', d: '2.2s' },
  { x: '48%', d: '0.4s' },
  { x: '62%', d: '1.7s' },
  { x: '76%', d: '2.6s' },
  { x: '90%', d: '0.9s' },
  { x: '97%', d: '1.9s' },
];

/** Premium electric-surge loading screen shown on first visit. */
export default function LoadingScreen({ visible }: Props) {
  const { t } = useI18n();
  return (
    <div className={`splash ${visible ? '' : 'splash--hidden'}`} aria-hidden={!visible}>
      <div className="splash__bg" aria-hidden="true" />
      <div className="splash__flares" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="splash__veins" aria-hidden="true">
        {VEINS.map((v, i) => (
          <i key={i} style={{ ['--x' as string]: v.x, ['--d' as string]: v.d }} />
        ))}
      </div>

      <div className="splash__brandmark">
        <div className="splash__logo">
          <span className="splash__ripple splash__ripple--1" />
          <span className="splash__ripple splash__ripple--2" />
          <span className="splash__ripple splash__ripple--3" />
          <BrandLogo size={160} glow />
        </div>
      </div>

      <div className="splash__inner">
        <p className="splash__motto">{t('f.motto')}</p>
      </div>

      <div className="splash__ticker" aria-hidden="true">
        <div className="splash__ticker-track">
          {[0, 1].map((dup) =>
            SERVICES.map((s) => (
              <span key={`${dup}-${s.slug}`} className="splash__ticker-item">
                {s.short} <i>✦</i>
              </span>
            )),
          )}
        </div>
      </div>
    </div>
  );
}