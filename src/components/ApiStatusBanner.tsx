import { useEffect, useState } from 'react';
import { CloudOff, RefreshCw, X } from 'lucide-react';
import { apiStatus, checkApiHealth, onApiStatus } from '../data/api';
import { useI18n } from '../i18n';

/**
 * Tells the truth about where data lives.
 *
 * The failure this guards against is quiet and expensive: the API is
 * unreachable, the save lands only in this browser's localStorage, and the
 * portal looks exactly like a successful shared save. The next person to open
 * the console sees none of it, and nobody knows the change was lost.
 *
 * Shown only inside the portals, where an unsaved change actually matters.
 */
export default function ApiStatusBanner({ variant = 'portal' }: { variant?: 'portal' | 'global' }) {
  const { t } = useI18n();
  const [status, setStatus] = useState(apiStatus());
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => onApiStatus(setStatus), []);

  // Probing on mount is what turns "we have not tried yet" into a real answer.
  useEffect(() => {
    void checkApiHealth();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void checkApiHealth();
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  // A recovered connection is good news: un-dismiss so the next outage warns again.
  useEffect(() => {
    if (status === 'online') setDismissed(false);
  }, [status]);

  if (variant === 'global') {
    // The public site still works without the API, so this is a quiet note, not
    // an alarm, and never blocks anything.
    if (status !== 'offline' || dismissed) return null;
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[60] rounded-[2px] border border-amber-500/30 bg-obsidian px-4 py-3 shadow-lg">
        <div className="flex items-start gap-3">
          <CloudOff size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <p className="text-xs text-ash leading-relaxed flex-1">{t('api.offlineGlobal')}</p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={t('api.dismiss')}
            className="shrink-0 text-[#5a5a5a] hover:text-ash"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (status === 'online' || status === 'checking' || dismissed) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 border-b border-amber-500/30 bg-amber-500/10 backdrop-blur-sm"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <CloudOff size={15} className="shrink-0 text-amber-400" />
        <p className="text-xs text-amber-100/90 leading-relaxed flex-1">
          {t('api.offlinePortal')}
        </p>
        <button
          type="button"
          disabled={checking}
          onClick={async () => {
            setChecking(true);
            await checkApiHealth();
            setChecking(false);
          }}
          className="shrink-0 inline-flex items-center gap-1.5 text-[0.65rem] tracking-wide uppercase px-2.5 py-1.5 border border-amber-500/40 text-amber-200 hover:bg-amber-500/10 disabled:opacity-60"
          style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
        >
          <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />
          {t('api.retry')}
        </button>
      </div>
    </div>
  );
}
