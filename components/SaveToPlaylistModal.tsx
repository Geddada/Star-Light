import React, { useState, useEffect } from 'react';
import { X, Plus, CheckSquare, Square, Lock } from 'lucide-react';
import { Video, Playlist } from '../types';

interface SaveToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
}

export const SaveToPlaylistModal: React.FC<SaveToPlaylistModalProps> = ({ isOpen, onClose, video }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, video.id]);

  const loadData = () => {
    // Load Watch Later status
    const watchLaterJson = localStorage.getItem('watch_later_videos');
    if (watchLaterJson) {
      const watchLaterVideos: Video[] = JSON.parse(watchLaterJson);
      setIsInWatchLater(watchLaterVideos.some(v => v.id === video.id));
    } else {
      setIsInWatchLater(false);
    }

    // Load Custom Playlists
    const playlistsJson = localStorage.getItem('starlight_playlists');
    if (playlistsJson) {
      setPlaylists(JSON.parse(playlistsJson));
    } else {
      setPlaylists([]);
    }
  };

  const toggleWatchLater = () => {
    const watchLaterJson = localStorage.getItem('watch_later_videos');
    let watchLaterVideos: Video[] = watchLaterJson ? JSON.parse(watchLaterJson) : [];

    if (isInWatchLater) {
      watchLaterVideos = watchLaterVideos.filter(v => v.id !== video.id);
      setIsInWatchLater(false);
    } else {
      watchLaterVideos.push(video);
      setIsInWatchLater(true);
    }
    localStorage.setItem('watch_later_videos', JSON.stringify(watchLaterVideos));
  };

  const togglePlaylist = (playlistId: string) => {
    const updatedPlaylists = playlists.map(pl => {
      if (pl.id === playlistId) {
        const exists = pl.videos.some(v => v.id === video.id);
        let newVideos;
        if (exists) {
          newVideos = pl.videos.filter(v => v.id !== video.id);
        } else {
          newVideos = [...pl.videos, video];
        }
        return { ...pl, videos: newVideos };
      }
      return pl;
    });
    
    setPlaylists(updatedPlaylists);
    localStorage.setItem('starlight_playlists', JSON.stringify(updatedPlaylists));
    // Dispatch event so Sidebar updates
    window.dispatchEvent(new Event('playlistsUpdated'));
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name: newPlaylistName,
      videos: [video], // Add current video immediately
      createdAt: new Date().toISOString()
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem('starlight_playlists', JSON.stringify(updatedPlaylists));
    
    setNewPlaylistName('');
    setShowCreateForm(false);
    // Dispatch event so Sidebar updates
    window.dispatchEvent(new Event('playlistsUpdated'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-xs overflow-hidden border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-primary)]">
          <h2 className="text-base font-bold text-[var(--text-primary)]">Save to...</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {/* Watch Later Option */}
          <div 
            onClick={toggleWatchLater}
            className="flex items-center gap-3 p-3 hover:bg-[var(--background-tertiary)] rounded-lg cursor-pointer transition-colors"
          >
            {isInWatchLater ? (
              <CheckSquare className="w-5 h-5 text-[hsl(var(--accent-color))] fill-[hsl(var(--accent-color))]/20" />
            ) : (
              <Square className="w-5 h-5 text-[var(--text-secondary)]" />
            )}
            <span className="text-sm font-medium text-[var(--text-primary)]">Watch Later</span>
          </div>

          {/* Custom Playlists */}
          {playlists.map(playlist => {
            const isIncluded = playlist.videos.some(v => v.id === video.id);
            return (
              <div 
                key={playlist.id}
                onClick={() => togglePlaylist(playlist.id)}
                className="flex items-center gap-3 p-3 hover:bg-[var(--background-tertiary)] rounded-lg cursor-pointer transition-colors"
              >
                 {isIncluded ? (
                  <CheckSquare className="w-5 h-5 text-[hsl(var(--accent-color))] fill-[hsl(var(--accent-color))]/20" />
                ) : (
                  <Square className="w-5 h-5 text-[var(--text-secondary)]" />
                )}
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">{playlist.name}</span>
                <Lock className="w-3 h-3 text-[var(--text-tertiary)] ml-auto" />
              </div>
            );
          })}
        </div>

        {/* Create New Playlist Section */}
        {!showCreateForm ? (
          <div 
            onClick={() => setShowCreateForm(true)}
            className="p-4 border-t border-[var(--border-primary)] flex items-center gap-3 cursor-pointer hover:bg-[var(--background-tertiary)] transition-colors"
          >
            <Plus className="w-5 h-5 text-[var(--text-primary)]" />
            <span className="text-sm font-bold text-[var(--text-primary)]">Create new playlist</span>
          </div>
        ) : (
          <form onSubmit={handleCreatePlaylist} className="p-4 border-t border-[var(--border-primary)] flex flex-col gap-3">
            <div className="flex flex-col gap-1">
               <label className="text-xs font-semibold text-[var(--text-secondary)]">Name</label>
               <input 
                  autoFocus
                  type="text" 
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name..."
                  className="bg-[var(--background-primary)] border-b-2 border-[var(--text-secondary)] focus:border-[hsl(var(--accent-color))] outline-none py-1 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                  maxLength={150}
               />
            </div>
            
            <div className="flex justify-end gap-2 mt-1">
               <button 
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
               </button>
               <button 
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-3 py-1.5 text-xs font-bold text-[hsl(var(--accent-color))] hover:text-[hsl(var(--accent-color))]/80 disabled:opacity-50 transition-colors"
                >
                  Create
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};