import { lazy, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import type { Booking } from '../data/editor';

const LocationPicker = lazy(() => import('./LocationPicker'));

class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    window.setTimeout(() => this.setState({ failed: false }), 0);
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="h-72 w-full flex flex-col items-center justify-center gap-4 bg-[#0e0e0e]">
          <p className="text-[0.7rem] tracking-[0.16em] uppercase text-[#6a6a6a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            The map could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ failed: false })}
            className="btn-ember px-5 py-2.5 rounded-[2px] text-[0.7rem]"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function BookingMapModal({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  if (!booking) return null;
  const pinned = typeof booking.lat === 'number' && typeof booking.lng === 'number';
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-[#0e0e0e] border border-[rgba(37,99,235,0.18)] rounded-[2px] shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="min-w-0">
            <p className="text-[0.58rem] tracking-[0.16em] uppercase text-ember mb-1" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
              Booking Location
            </p>
            <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              {booking.name} — {booking.service}
            </p>
            <p className="text-[0.62rem] text-[#5a5a5a] truncate" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{booking.location}</p>
          </div>
          <button onClick={onClose} title="Close map" className="text-[#4a4a4a] hover:text-white transition-colors duration-150 shrink-0">
            <i className="bx bx-x text-2xl" />
          </button>
        </div>
        <Suspense
          fallback={
            <div className="h-72 flex items-center justify-center gap-3 bg-[#0e0e0e]">
              <i className="bx bx-loader-alt bx-spin text-lg text-ember" />
              <p className="text-[0.7rem] tracking-[0.16em] uppercase text-[#6a6a6a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Loading map…</p>
            </div>
          }
        >
          <MapBoundary>
            {pinned ? (
              <LocationPicker
                value={{ lat: booking.lat as number, lng: booking.lng as number }}
                focus={{ lat: booking.lat as number, lng: booking.lng as number }}
                fill
                viewOnly
                onChange={() => {}}
              />
            ) : (
              <div className="h-72 flex flex-col items-center justify-center gap-2 bg-[#0e0e0e] px-6 text-center">
                <i className="bx bx-map-pin text-2xl text-[#3a3a3a]" />
                <p className="text-[0.68rem] text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  No map pin for this booking yet.
                </p>
              </div>
            )}
          </MapBoundary>
        </Suspense>
      </div>
    </div>
  );
}
