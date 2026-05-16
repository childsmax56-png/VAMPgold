import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, Clapperboard } from 'lucide-react';
import { Era, Song, SearchFilters } from '../types';
import { createSlug, CUSTOM_IMAGES } from '../utils';
import { MvEntry, RemixEntry, SampleEntry } from '../App';

export interface MiscEntry {
  Era: string;
  Name: string;
  Notes: string;
  Length: string;
  'Release Date': string;
  'Shoot Date': string;
  Type: string;
  Availability: string;
  Status: string;
  'Link(s)': string;
}

interface MiscItem {
  era: string;
  name: string;
  notes: string;
  length: string;
  releaseDate: string;
  shootDate: string;
  type: string;
  availability: string;
  status: string;
  links: string[];
  section: 'Unreleased' | 'Released';
}

interface MiscEraGroup {
  name: string;
  image?: string;
  unreleased: MiscItem[];
  released: MiscItem[];
  total: number;
}

interface MiscViewProps {
  eras: Era[];
  miscData: MiscEntry[];
  searchQuery: string;
  filters: SearchFilters;
  onPlaySong: (song: Song, era: Era, contextTracks?: Song[]) => void;
  currentSong?: Song | null;
  isPlaying?: boolean;
  mvData?: MvEntry[];
  remixData?: RemixEntry[];
  samplesData?: SampleEntry[];
  toggleFavorite?: (song: Song, eraName: string) => void;
  favoriteKeys?: { songName: string; eraName: string; url: string }[];
}

const TYPE_COLORS: Record<string, string> = {
  'Studio Footage': 'text-amber-400 border-amber-500/20 bg-amber-500/5',
  'Documentary': 'text-purple-400 border-purple-500/20 bg-purple-500/5',
  'Interview': 'text-sky-400 border-sky-500/20 bg-sky-500/5',
  'Live Performance': 'text-green-400 border-green-500/20 bg-green-500/5',
  'Promo': 'text-pink-400 border-pink-500/20 bg-pink-500/5',
  'Promo/Music Video': 'text-rose-400 border-rose-500/20 bg-rose-500/5',
  'Visualizer': 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
  'Other': 'text-white/40 border-white/10 bg-white/5',
  'Unknown': 'text-white/30 border-white/10 bg-white/5',
};

const AVAILABILITY_COLORS: Record<string, string> = {
  'Full': 'text-green-400 border-green-500/20 bg-green-500/5',
  'OG File': 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
  'Snippet': 'text-blue-400 border-blue-500/20 bg-blue-500/5',
  'LQ Snippet': 'text-blue-300/70 border-blue-400/15 bg-blue-400/5',
  'Partial': 'text-orange-400 border-orange-500/20 bg-orange-500/5',
  'Recording': 'text-purple-400 border-purple-500/20 bg-purple-500/5',
  'Screenshot': 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
  'Never Recorded': 'text-red-400/50 border-red-500/10 bg-red-500/5',
};

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getLinkLabel(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('drive.google.com')) return 'Drive';
  if (url.includes('pillows.su')) return 'Pillowcase';
  if (url.includes('archive.org')) return 'Archive.org';
  if (url.includes('vimeo.com')) return 'Vimeo';
  if (url.includes('streamable.com')) return 'Streamable';
  if (url.includes('mega.nz')) return 'MEGA';
  if (url.includes('tumblr.com')) return 'Tumblr';
  return 'Link';
}

function getEmbedSrc(links: string[]): string | null {
  for (const link of links) {
    if (link.includes('youtube.com') || link.includes('youtu.be')) {
      const id = extractYouTubeId(link);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  }
  return null;
}

function parseMiscData(rows: MiscEntry[], allEras: Era[]): MiscEraGroup[] {
  const eraGroups: Record<string, { unreleased: MiscItem[]; released: MiscItem[] }> = {};
  const eraOrder: string[] = [];

  for (const row of rows) {
    const era = row.Era?.trim() || '';
    const name = row.Name?.trim() || '';
    if (!era || !name) continue;

    if (!eraGroups[era]) {
      eraGroups[era] = { unreleased: [], released: [] };
      eraOrder.push(era);
    }

    const rawLinks = row['Link(s)'] || '';
    const links = rawLinks
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.toLowerCase().includes('link needed') && !l.toLowerCase().includes('source needed'));

    const rawStatus = row.Status?.trim() || '';
    const section: 'Unreleased' | 'Released' = rawStatus === 'Unreleased' ? 'Unreleased' : 'Released';

    const item: MiscItem = {
      era,
      name,
      notes: row.Notes?.trim() || '',
      length: row.Length?.trim() || '',
      releaseDate: row['Release Date']?.trim() || '',
      shootDate: row['Shoot Date']?.trim() || '',
      type: row.Type?.trim() || '',
      availability: row.Availability?.trim() || '',
      status: rawStatus,
      links,
      section,
    };

    if (section === 'Unreleased') {
      eraGroups[era].unreleased.push(item);
    } else {
      eraGroups[era].released.push(item);
    }
  }

  return eraOrder
    .map(name => {
      const group = eraGroups[name];
      const matchingEra = allEras.find(e => e.name === name);
      return {
        name,
        image: CUSTOM_IMAGES[name] || matchingEra?.image,
        unreleased: group.unreleased,
        released: group.released,
        total: group.unreleased.length + group.released.length,
      };
    })
    .filter(g => g.total > 0);
}

// ─── Item row ───────────────────────────────────────────────────────────────

function MiscItemRow({ item }: { item: MiscItem }) {
  const [expanded, setExpanded] = useState(false);
  const [activeLink, setActiveLink] = useState(0);

  const isUnavailable = !item.links.length;
  const typeColor = TYPE_COLORS[item.type] || 'text-white/40 border-white/10 bg-white/5';
  const availColor = AVAILABILITY_COLORS[item.availability] || 'text-white/40 border-white/10 bg-white/5';

  const activeLinkUrl = item.links[activeLink] ?? item.links[0];
  const embedSrc = activeLinkUrl ? getEmbedSrc([activeLinkUrl]) : null;

  return (
    <div className={`rounded-md overflow-hidden border transition-colors ${
      expanded ? 'border-white/15 bg-white/[0.03]' : 'border-transparent hover:border-white/10 hover:bg-white/[0.02]'
    }`}>
      <div
        onClick={() => { if (!isUnavailable) setExpanded(e => !e); }}
        className={`flex items-start gap-3 px-3 py-2.5 ${isUnavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="mt-0.5 shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/20" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-medium text-white truncate">{item.name}</span>
            {item.length && item.length !== 'N/A' && (
              <span className="text-[10px] text-white/30 shrink-0">{item.length}</span>
            )}
          </div>
          {item.notes && (
            <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{item.notes}</p>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-1.5 flex-wrap justify-end">
          {item.type && (
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${typeColor}`}>
              {item.type}
            </span>
          )}
          {item.availability && item.availability !== 'N/A' && (
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${availColor}`}>
              {item.availability}
            </span>
          )}
          {item.status && item.status !== 'Officially Released' && item.status !== 'Unofficially Released' && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/50 bg-white/5">
              {item.status}
            </span>
          )}
          {item.links.length > 0 && !expanded && (
            <ExternalLink className="w-3.5 h-3.5 text-white/30" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-4 space-y-3">
              {item.links.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {item.links.map((link, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveLink(i)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                        i === activeLink
                          ? 'border-[var(--theme-color)] text-[var(--theme-color)] bg-[var(--theme-color)]/10'
                          : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {getLinkLabel(link)}
                    </button>
                  ))}
                </div>
              )}

              {embedSrc ? (
                <div className="w-full aspect-video rounded-md overflow-hidden bg-black">
                  <iframe
                    src={embedSrc}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
              ) : (
                item.links.length > 0 && (
                  <div className="text-xs text-white/40 italic">
                    No embeddable player available for this source.
                  </div>
                )
              )}

              {item.links.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {item.links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--theme-color)]/70 hover:text-[var(--theme-color)] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {getLinkLabel(link)}
                    </a>
                  ))}
                </div>
              )}

              {item.releaseDate && item.releaseDate !== 'N/A' && (
                <p className="text-[10px] text-white/30">Released: {item.releaseDate}</p>
              )}
              {item.shootDate && item.shootDate !== 'N/A' && (
                <p className="text-[10px] text-white/30">Filmed: {item.shootDate}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Era detail view ─────────────────────────────────────────────────────────

function EraDetailView({ eraGroup, onBack, searchQuery }: {
  eraGroup: MiscEraGroup;
  onBack: () => void;
  searchQuery: string;
}) {
  const filterItems = (items: MiscItem[]) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      i => i.name.toLowerCase().includes(q) || i.notes.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)
    );
  };

  const filteredUnreleased = filterItems(eraGroup.unreleased);
  const filteredReleased = filterItems(eraGroup.released);

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="absolute inset-0 z-10 bg-yzy-black overflow-y-auto custom-scrollbar pb-64"
    >
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start gap-6 md:gap-8 border-b border-white/5 bg-white/5">
        <button
          onClick={onBack}
          className="cursor-pointer mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-32 h-32 md:w-48 md:h-48 rounded-md overflow-hidden bg-white/5 shrink-0 shadow-xl">
          {eraGroup.image ? (
            <img
              src={eraGroup.image}
              alt={eraGroup.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Clapperboard className="w-12 h-12 text-white/20" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end h-full py-2">
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              {eraGroup.name}
            </h1>
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Misc
            </span>
          </div>
          <p className="text-white/50 text-sm">
            {eraGroup.unreleased.length > 0 && `${eraGroup.unreleased.length} unreleased`}
            {eraGroup.unreleased.length > 0 && eraGroup.released.length > 0 && ' · '}
            {eraGroup.released.length > 0 && `${eraGroup.released.length} released`}
          </p>
        </div>
      </div>

      <div className="px-4 md:px-8 mt-6 max-w-4xl mx-auto space-y-8">
        {filteredUnreleased.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-400/70" />
              Unreleased
            </h2>
            <div className="space-y-1">
              {filteredUnreleased.map((item, i) => (
                <MiscItemRow key={i} item={item} />
              ))}
            </div>
          </section>
        )}

        {filteredReleased.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400/70" />
              Released
            </h2>
            <div className="space-y-1">
              {filteredReleased.map((item, i) => (
                <MiscItemRow key={i} item={item} />
              ))}
            </div>
          </section>
        )}

        {filteredUnreleased.length === 0 && filteredReleased.length === 0 && (
          <p className="text-white/40 text-sm text-center py-8">No results found.</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main view ───────────────────────────────────────────────────────────────

export function MiscView({ eras, miscData, searchQuery }: MiscViewProps) {
  const [selectedEra, setSelectedEra] = useState<string | null>(null);

  const eraGroups = useMemo(() => parseMiscData(miscData, eras), [miscData, eras]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/misc/')) {
      const slug = path.split('/misc/')[1];
      if (slug) {
        const match = eraGroups.find(g => createSlug(g.name) === slug);
        if (match) setSelectedEra(match.name);
      }
    }
  }, [eraGroups]);

  useEffect(() => {
    if (selectedEra) {
      const newPath = `/misc/${createSlug(selectedEra)}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ miscEra: selectedEra }, '', newPath);
      }
    } else {
      if (window.location.pathname.startsWith('/misc/')) {
        window.history.pushState({ miscEra: null }, '', '/misc');
      }
    }
  }, [selectedEra]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/misc/')) {
        const slug = path.split('/misc/')[1];
        const match = eraGroups.find(g => createSlug(g.name) === slug);
        setSelectedEra(match ? match.name : null);
      } else if (path === '/misc') {
        setSelectedEra(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [eraGroups]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return eraGroups;
    const q = searchQuery.toLowerCase();
    return eraGroups.filter(g =>
      g.name.toLowerCase().includes(q) ||
      [...g.unreleased, ...g.released].some(
        i => i.name.toLowerCase().includes(q) || i.notes.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)
      )
    );
  }, [eraGroups, searchQuery]);

  const selectedGroup = useMemo(
    () => eraGroups.find(g => g.name === selectedEra) || null,
    [eraGroups, selectedEra]
  );

  return (
    <>
      {selectedGroup ? (
        <EraDetailView
          eraGroup={selectedGroup}
          onBack={() => setSelectedEra(null)}
          searchQuery={searchQuery}
        />
      ) : (
        <motion.div
          key="misc-grid"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="p-6 md:p-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-32"
        >
          {filteredGroups.map((group, i) => (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5), duration: 0.3 }}
              onClick={() => setSelectedEra(group.name)}
              className="group flex flex-col gap-3 cursor-pointer"
            >
              <div className="relative aspect-square rounded-md overflow-hidden bg-white/5 border border-white/5 group-hover:border-white/20 transition-colors">
                {group.image ? (
                  <img
                    src={group.image}
                    alt={group.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Clapperboard className="w-10 h-10 text-white/20" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-end">
                  {group.unreleased.length > 0 && (
                    <span className="bg-black/70 backdrop-blur-sm text-orange-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {group.unreleased.length} Unrel.
                    </span>
                  )}
                  {group.released.length > 0 && (
                    <span className="bg-black/70 backdrop-blur-sm text-green-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {group.released.length} Rel.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:underline truncate">
                  {group.name}
                </h3>
                <p className="text-xs text-white/40">{group.total} item{group.total !== 1 ? 's' : ''}</p>
              </div>
            </motion.div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="col-span-full text-center py-16 text-white/30 text-sm">
              No eras found.
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
