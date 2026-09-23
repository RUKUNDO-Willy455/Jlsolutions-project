import { useRef, useState } from 'react';
import { fileToDataUrl } from '../data/editor';

export function AvatarUpload({
  value, onChange, initials = '', size = 80,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  initials?: string;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const dataUrl = await fileToDataUrl(file);
    onChange(dataUrl);
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-start gap-5">
      <div className="relative shrink-0">
        {value ? (
          <img
            src={value}
            alt="Profile"
            className="rounded-full object-cover border-2 border-[rgba(37,99,235,0.5)]"
            style={{ width: size, height: size, boxShadow: '0 0 0 4px rgba(37,99,235,0.1)' }}
          />
        ) : (
          <div
            className="rounded-full bg-[rgba(37,99,235,0.12)] border-2 border-[rgba(37,99,235,0.35)] flex items-center justify-center text-lg font-semibold text-ember"
            style={{ width: size, height: size, boxShadow: '0 0 0 4px rgba(37,99,235,0.08)', fontFamily: 'Fraunces, Georgia, serif' }}
          >
            {initials}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn-ghost px-4 py-2 rounded-[2px] text-xs disabled:opacity-60"
        >
          {busy ? 'Processing…' : (value ? 'Change Photo' : 'Upload Photo')}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[0.62rem] text-[#3a3a3a] hover:text-red-400 transition-colors duration-150 self-start"
          >
            Remove photo
          </button>
        )}
        <p className="text-[0.6rem] text-[#3a3a3a] max-w-[220px]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
          JPG or PNG · stored locally
        </p>
      </div>
    </div>
  );
}