import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Play, Trash2, Pencil, Check, X, ChevronUp, ChevronDown, ListMusic, Shuffle, Share2, ImagePlus } from 'lucide-react';
import { usePlaylists } from '../PlaylistContext';
import { Era, Song } from '../types';
import { ArtEntry, ArtImage } from './ArtGallery';
import { CoverPickerModal } from './CoverPickerModal';

interface Props {
  eras: Era[];
  artData?: ArtEntry[];
  searchQuery?: string;
  onPlaySong: (song: Song, era: Era, contextTracks?: Song[]) => void;
  onToast?: (msg: string) => void;
}

function resolvePlaylistSongs(playlist: ReturnType<typeof usePlaylists>['playlists'][0], eras: Era[]): Song[] {
  return playlist.songs
    .map(entry => {
      const realEra = eras.find(e => e.name === entry.eraName);
      if (realEra) {
        const allSongs = Object.values(realEra.data).flat();
        const found = allSongs.find(s => s.name === entry.songName && (s.url || (s.urls?.[0] ?? '')) === entry.url);
        if (found) return { ...found, realEra };
      }
      if (entry.song) return { ...entry.song, realEra: realEra ?? undefined };
      return null;
    })
    .filter((s): s is Song => s !== null);
}

export function PlaylistsView({ eras, artData = [], searchQuery = '', onPlaySong, onToast }: Props) {
  const { playlists, createPlaylist, renamePlaylist, deletePlaylist, removeFromPlaylist, moveSong, setCover } = usePlaylists();
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');

  const selectedPlaylist = playlists.find(p => p.id === selectedId) ?? null;

  const filteredPlaylists = searchQuery
    ? playlists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : playlists;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createPlaylist(newName.trim());
    setSelectedId(id);
    setNewName('');
    setCreatingNew(false);
  };

  const handleRenameConfirm = () => {
    if (renamingId && renameValue.trim()) renamePlaylist(renamingId, renameValue.trim());
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDelete = (id: string) => {
    deletePlaylist(id);
    if (selectedId === id) setSelectedId(null);
  };

  const sharePlaylist = (playlist: ReturnType<typeof usePlaylists>['playlists'][0]) => {
    const data = { name: playlist.name, songs: playlist.songs.map(s => ({ songName: s.songName, eraName: s.eraName, url: s.url })) };
    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    const url = `${window.location.origin}${window.location.pathname}?playlist=${encodeURIComponent(encoded)}`;
    navigator.clipboard.writeText(url).then(() => onToast?.('Playlist link copied!')).catch(() => onToast?.('Failed to copy link'));
  };

  const playAll = (shuffle = false) => {
    if (!selectedPlaylist) return;
    const songs = resolvePlaylistSongs(selectedPlaylist, eras).filter(s => s.url || s.urls?.length);
    if (!songs.length) return;
    let ordered = [...songs];
    if (shuffle) {
      for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
    }
    const first = ordered[0];
    const era = first.realEra as Era ?? eras[0];
    onPlaySong(first, era, ordered);
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex h-full min-h-0"
    >
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-white/50">Playlists</span>
          <button
            onClick={() => { setCreatingNew(true); setSelectedId(null); }}
            className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="New playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredPlaylists.length === 0 && !creatingNew && (
            <div className="px-4 py-8 text-center text-white/30 text-xs">
              No playlists yet.<br />
              <button
                onClick={() => setCreatingNew(true)}
                className="mt-2 text-[var(--theme-color)] hover:opacity-80 transition-opacity cursor-pointer"
              >
                Create one
              </button>
            </div>
          )}
          {filteredPlaylists.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedId(p.id); setCreatingNew(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                selectedId === p.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {p.cover
                ? <div className="w-8 h-8 rounded overflow-hidden shrink-0"><ArtImage url={p.cover} alt={p.name} /></div>
                : <ListMusic className="w-4 h-4 shrink-0 text-white/30" />
              }
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-[10px] text-white/30">{p.songs.length} song{p.songs.length !== 1 ? 's' : ''}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {creatingNew ? (
            <motion.div
              key="create"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 max-w-md"
            >
              <h2 className="text-lg font-bold text-white mb-6">New Playlist</h2>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreatingNew(false); setNewName(''); } }}
                placeholder="Playlist name..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCreate}
                  className="px-6 py-2 rounded-lg bg-[var(--theme-color)]/20 text-[var(--theme-color)] text-sm font-semibold hover:bg-[var(--theme-color)]/30 transition-colors cursor-pointer"
                >
                  Create
                </button>
                <button
                  onClick={() => { setCreatingNew(false); setNewName(''); }}
                  className="px-6 py-2 rounded-lg bg-white/5 text-white/50 text-sm font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : selectedPlaylist ? (
            <motion.div
              key={selectedPlaylist.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              {/* Playlist header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-start gap-5">
                {/* Cover */}
                <button
                  onClick={() => setShowCoverPicker(true)}
                  className="group relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-[var(--theme-color)] transition-all cursor-pointer"
                  title="Change cover"
                >
                  {selectedPlaylist.cover ? (
                    <ArtImage url={selectedPlaylist.cover} alt={selectedPlaylist.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ListMusic className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImagePlus className="w-5 h-5 text-white" />
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  {renamingId === selectedPlaylist.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') { setRenamingId(null); } }}
                        className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-white/40"
                      />
                      <button onClick={handleRenameConfirm} className="p-1 text-[var(--theme-color)] hover:opacity-80 cursor-pointer"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setRenamingId(null)} className="p-1 text-white/40 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-white truncate">{selectedPlaylist.name}</h1>
                      <button
                        onClick={() => { setRenamingId(selectedPlaylist.id); setRenameValue(selectedPlaylist.name); }}
                        className="p-1 text-white/30 hover:text-white transition-colors cursor-pointer"
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-white/40 mt-0.5">{selectedPlaylist.songs.length} song{selectedPlaylist.songs.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPlaylist.songs.length > 0 && (
                    <>
                      <button
                        onClick={() => playAll(false)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--theme-color)]/20 text-[var(--theme-color)] text-xs font-semibold uppercase tracking-wider hover:bg-[var(--theme-color)]/30 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Play All
                      </button>
                      <button
                        onClick={() => playAll(true)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 text-white/60 text-xs font-semibold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        Shuffle
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => sharePlaylist(selectedPlaylist)}
                    className="p-2 rounded text-white/30 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copy share link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedPlaylist.id)}
                    className="p-2 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Song list */}
              {selectedPlaylist.songs.length === 0 ? (
                <div className="py-16 text-center text-white/30 text-sm">
                  No songs yet. Add songs from any era using the <ListMusic className="w-4 h-4 inline mx-1" /> button.
                </div>
              ) : (
                <div className="py-2">
                  {selectedPlaylist.songs.map((entry, i) => {
                    const resolved = resolvePlaylistSongs({ ...selectedPlaylist, songs: [entry] }, eras)[0];
                    const displayName = entry.songName;
                    const displayEra = entry.eraName;
                    return (
                      <div
                        key={`${entry.url}-${i}`}
                        className="group flex items-center px-6 py-2.5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => {
                          if (!resolved) return;
                          const allSongs = resolvePlaylistSongs(selectedPlaylist, eras).filter(s => s.url || s.urls?.length);
                          const era = resolved.realEra as Era ?? eras[0];
                          onPlaySong(resolved, era, allSongs);
                        }}
                      >
                        <span className="w-8 text-xs font-mono text-white/30 group-hover:text-white/60 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="text-sm font-medium text-white truncate">{displayName}</div>
                          <div className="text-[10px] text-white/40 mt-0.5">{displayEra}</div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); if (i > 0) moveSong(selectedPlaylist.id, i, i - 1); }}
                            disabled={i === 0}
                            className="p-1 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (i < selectedPlaylist.songs.length - 1) moveSong(selectedPlaylist.id, i, i + 1); }}
                            disabled={i === selectedPlaylist.songs.length - 1}
                            className="p-1 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromPlaylist(selectedPlaylist.id, entry.url, entry.songName); }}
                            className="p-1 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full py-32 text-white/30"
            >
              <ListMusic className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">Select a playlist or create a new one</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>

    {showCoverPicker && selectedPlaylist && (
      <CoverPickerModal
        eras={eras}
        artData={artData}
        onSelect={(url) => setCover(selectedPlaylist.id, url)}
        onClose={() => setShowCoverPicker(false)}
      />
    )}
    </>
  );
}
