$ErrorActionPreference='Stop'
$root = $env:ROOT
function ReadF($p){ $sc = New-Object System.Text.StringBuilder; Get-Content -LiteralPath $p -Encoding UTF8 | ForEach-Object { [void]$sc.AppendLine($_) }; $sc.ToString() }
function WriteF($p, $s){ [System.IO.File]::WriteAllText($p, $s, (New-Object System.Text.UTF8Encoding($false))) }

# ---- 1) LocationPicker.tsx: viewOnly prop ----
$lp = "$root\src\components\LocationPicker.tsx"
$s = ReadF $lp
$p1 = "interface Props {
  value: { lat: number; lng: number } | null;
  focus?: MapFocus | null;
  fill?: boolean;
  onChange: (pick: LocationPick | null) => void;
}"
$r1 = "interface Props {
  value: { lat: number; lng: number } | null;
  focus?: MapFocus | null;
  fill?: boolean;
  viewOnly?: boolean;
  onChange: (pick: LocationPick | null) => void;
}"
if (($s -match [regex]::Escape($p1)) -eq $false){ throw "LP props block not found" }
$s = $s.Replace($p1, $r1)

if ($s -notmatch [regex]::Escape("function LocationPicker({ value, focus, fill = false, onChange }: Props)")) { throw "LP signature not found" }
$s = $s.Replace("function LocationPicker({ value, focus, fill = false, onChange }: Props)", "function LocationPicker({ value, focus, fill = false, viewOnly = false, onChange }: Props)")

if ($s -match [regex]::Escape("export default function LocationPicker({ value, focus, fill = false, onChange }: Props)")) { throw "LP export signature" }
$s = $s.Replace("export default function LocationPicker({ value, focus, fill = false, onChange }: Props)", "export default function LocationPicker({ value, focus, fill = false, viewOnly = false, onChange }: Props)")

# loadPois guard
if ($s -notmatch [regex]::Escape("const loadPois = async (lat: number, lng: number, radius: number) => {")) { throw "LP loadPois not found" }
$s = $s.Replace("const loadPois = async (lat: number, lng: number, radius: number) => {", "const loadPois = async (lat: number, lng: number, radius: number) => {`n    if (viewOnly) return;")

# map click handler guard
if ($s -notmatch [regex]::Escape("    map.on('click', (e: L.LeafletMouseEvent) => {")) { throw "LP click handler not found" }
$s = $s.Replace("    map.on('click', (e: L.LeafletMouseEvent) => {", "    map.on('click', (e: L.LeafletMouseEvent) => {`n      if (viewOnly) return;")

# marker not draggable in viewOnly
$s = $s.Replace("const mk = L.marker([lat, lng], { icon: PIN, draggable: true }).addTo(map);", "const mk = L.marker([lat, lng], { icon: PIN, draggable: !viewOnly }).addTo(map);")
WriteF $lp $s
"LP patched"

# ---- 2) BookingMapModal.tsx (new) ----
$modal = @"
import { Component, lazy, Suspense } from 'react';
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
        <div className="h-72 w-full flex flex-col items-center justify-center gap-2 bg-[#0a0a0a]">
          <p className="text-[0.7rem] text-[#6a6a6a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Map tiles could not be loaded.</p>
          <p className="text-[0.6rem] text-[#3a3a3a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Please check your connection and try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function BookingMapModal({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  if (!booking) return null;
  const hasCoords = typeof booking.lat === 'number' && typeof booking.lng === 'number';
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-[#0d0d0d] border border-[rgba(37,99,235,0.25)] rounded-[2px] shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="min-w-0">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ember mb-1" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Booking location</p>
            <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{booking.name} &mdash; {booking.service}</p>
            <p className="text-[0.62rem] text-[#5a5a5a] truncate" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{booking.location}</p>
          </div>
          <button onClick={onClose} title="Close map" className="text-[#4a4a4a] hover:text-white transition-colors duration-150 shrink-0">
            <i className="bx bx-x text-2xl" />
          </button>
        </div>
        <Suspense fallback={<div className="h-72 flex items-center justify-center bg-[#0a0a0a]"><p className="text-[0.7rem] text-[#5a5a5a] animate-pulse" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Loading map&hellip;</p></div>}>
          <MapBoundary>
            {hasCoords ? (
              <LocationPicker value={{ lat: booking.lat, lng: booking.lng }} viewOnly fill onChange={() => undefined} />
            ) : (
              <div className="h-72 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a]">
                <p className="text-[0.7rem] text-[#6a6a6a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>No map pin for this booking.</p>
                <p className="text-[0.6rem] text-[#3a3a3a] text-center px-6" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>This booking has no coordinates. It was placed with the location name: <span className="text-[#8a8a8a]">{booking.location}</span></p>
              </div>
            )}
          </MapBoundary>
        </Suspense>
      </div>
    </div>
  );
}
"@
[System.IO.File]::WriteAllText("$root\src\components\BookingMapModal.tsx", $modal, (New-Object System.Text.UTF8Encoding($false)))
"BookingMapModal created"

# ---- 3) AdminPanel.tsx ----
$ap = "$root\src\components\AdminPanel.tsx"
$a = ReadF $ap
$importAnchor = "import type { Booking } from '../data/editor';"
$importAdd = "import type { Booking } from '../data/editor';`nimport BookingMapModal from './BookingMapModal';"
if ($a -notmatch [regex]::Escape($importAnchor)) { throw "AP import anchor not found" }
$a = $a.Replace($importAnchor, $importAdd)

$stateAnchor = "function BookingsTab({ bookings, setBookings }: { bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>> }) {`n  const [openMsg, setOpenMsg] = useState<string | null>(null);"
$stateAdd = "function BookingsTab({ bookings, setBookings }: { bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>> }) {`n  const [openMsg, setOpenMsg] = useState<string | null>(null);`n  const [mapBooking, setMapBooking] = useState<Booking | null>(null);"
if ($a -notmatch [regex]::Escape($stateAnchor)) { throw "AP state anchor not found" }
$a = $a.Replace($stateAnchor, $stateAdd)

# replace the mapLink anchor cell
$anchorBlock = "{mapLink(b) && (
                      <a href={mapLink(b)} target=""_blank"" rel=""noreferrer"" className=""inline-flex items-center gap-1 text-[0.6rem] text-ember/80 hover:text-ember transition-colors duration-150"">
                        <i className=""bx bx-map-pin text-[0.8rem]"" /> View on map
                      </a>
                    )}"
$anchorNew = "{typeof b.lat === 'number' && typeof b.lng === 'number' ? (
                      <button onClick={() => setMapBooking(b)} className=""inline-flex items-center gap-1 text-[0.6rem] text-ember/80 hover:text-ember transition-colors duration-150"">
                        <i className=""bx bx-map-pin text-[0.8rem]"" /> View on map
                      </button>
                    ) : mapLink(b) ? (
                      <a href={mapLink(b)} target=""_blank"" rel=""noreferrer"" className=""inline-flex items-center gap-1 text-[0.6rem] text-ember/80 hover:text-ember transition-colors duration-150"">
                        <i className=""bx bx-map-pin text-[0.8rem]"" /> View on map
                      </a>
                    ) : null}"
if ($a -notmatch [regex]::Escape($anchorBlock)) { throw "AP anchor block not found" }
$a = $a.Replace($anchorBlock, $anchorNew)

# mount modal: find the closing of BookingsTab return root (`];\n  );\n}:` after the last booking row) - insert before the final `</div>` of the flex-col root.
# We anchor on the unique sequence that ends BookingsTab (map bump): find  `      </table>` then next `    </div>` -> append modal sibling.
if ($a -notmatch [regex]::Escape("          </tbody>`n        </table>`n      </div>")) { throw "AP table close not found" }
$a = $a.Replace("          </tbody>`n        </table>`n      </div>", "          </tbody>`n        </table>`n      </div>`n`n      <BookingMapModal booking={mapBooking} onClose={() => setMapBooking(null)} />`n    </div>")
WriteF $ap $a
"AP patched"

# ---- 4) TechnicianPanel.tsx ----
$tp = "$root\src\components\TechnicianPanel.tsx"
$t = ReadF $tp
$imAnchor = "import { AvatarUpload } from './AvatarUpload';"
$imAdd = "import { AvatarUpload } from './AvatarUpload';`nimport BookingMapModal from './BookingMapModal';"
if ($t -notmatch [regex]::Escape($imAnchor)) { throw "TP import anchor not found" }
$t = $t.Replace($imAnchor, $imAdd)

# TechDashboard has bookings prop + myBookings; add state. Anchor: inside TechDashboard fn start
$stAnchor = "function TechDashboard({ tech, requests, setRequests, bookings }: { tech: Technician; requests: ProfileEditRequest[]; setRequests: React.Dispatch<React.SetStateAction<ProfileEditRequest[]>>; bookings: Booking[] }) {"
$stAdd = "function TechDashboard({ tech, requests, setRequests, bookings }: { tech: Technician; requests: ProfileEditRequest[]; setRequests: React.Dispatch<React.SetStateAction<ProfileEditRequest[]>>; bookings: Booking[] }) {`n  const [mapBooking, setMapBooking] = useState<{ id: string; name: string; service: string; location: string; lat?: number; lng?: number } | null>(null);"
if ($t -notmatch [regex]::Escape($stAnchor)) { throw "TP state anchor not found" }
$t = $t.Replace($stAnchor, $stAdd)

# In the Who Requested Me booking row: add a View on map button after the location <p>.
$rowAnchor = "              <p className=""text-xs text-[#4a4a4a] mt-2 flex items-center gap-1.5""><i className=""bx bx-map-pin text-[#3a3a3a]"" /> {b.location}</p>`n            </div>`n          ))}"
$rowAdd = "              <p className=""text-xs text-[#4a4a4a] mt-2 flex items-center gap-1.5""><i className=""bx bx-map-pin text-[#3a3a3a]"" /> {b.location}</p>`n              {typeof b.lat === 'number' && typeof b.lng === 'number' && (`n                <button onClick={() => setMapBooking({ id: b.id, name: b.name, service: b.service, location: b.location, lat: b.lat, lng: b.lng })} className=""mt-2 inline-flex items-center gap-1 text-[0.62rem] text-ember/80 hover:text-ember transition-colors duration-150"">`n                  <i className=""bx bx-map-pin text-[0.7rem]"" /> View on map`n                </button>`n              )}`n            </div>`n          ))}"
if ($t -notmatch [regex]::Escape($rowAnchor)) { throw "TP row anchor not found" }
$t = $t.Replace($rowAnchor, $rowAdd)

# mount modal — inside TechDashboard return root (flex flex-col gap-8). Insert before its closing `</div>`; anchor: the tail end of TechDashboard return.
$tailAnchor = "      </div>`n    </div>`n  );`n}`n`nfunction ProfileRequestsTab("
if ($t -notmatch [regex]::Escape($tailAnchor)) { throw "TP tail anchor not found: " + $tailAnchor }
$t = $t.Replace($tailAnchor, "      </div>`n      <BookingMapModal booking={mapBooking} onClose={() => setMapBooking(null)} />`n    </div>`n  );`n}`n`nfunction ProfileRequestsTab(")
WriteF $tp $t
"TP patched"
"ALL PATCHES DONE"
