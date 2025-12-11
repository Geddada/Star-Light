
import React, { useState, useEffect, useMemo } from 'react';
import { Video } from '../types';
import { Trash2, Search, Play, FileVideo, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ContentManagement: React.FC = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState<Video[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadVideos = () => {
            const uploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
            if (uploadedVideosJSON) {
                setVideos(JSON.parse(uploadedVideosJSON));
            }
        };
        loadVideos();
        
        window.addEventListener('videosUpdated', loadVideos);
        return () => window.removeEventListener('videosUpdated', loadVideos);
    }, []);

    const handleDelete = (videoId: string, title: string) => {
        if (window.confirm(`Are you sure you want to permanently delete the video "${title}"?`)) {
            const updatedVideos = videos.filter(v => v.id !== videoId);
            setVideos(updatedVideos);
            localStorage.setItem('starlight_uploaded_videos', JSON.stringify(updatedVideos));
            window.dispatchEvent(new Event('videosUpdated'));
        }
    };

    const filteredVideos = useMemo(() => {
        return videos.filter(v => 
            v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            v.uploaderName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [videos, searchTerm]);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center gap-3">
                <FileVideo className="w-8 h-8 text-[hsl(var(--accent-color))]"/>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Content Management</h1>
            </div>

            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h2 className="text-xl font-bold mb-4">All Uploaded Posts (Videos & Shorts)</h2>
                
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                    <input 
                        type="text"
                        placeholder="Search by title or uploader..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                    />
                </div>

                {filteredVideos.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-secondary)]">
                        <FileVideo className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No content found matching your search.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-[var(--background-secondary)] z-10 shadow-sm">
                                <tr className="border-b border-[var(--border-primary)]">
                                    <th className="p-3">Video</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Uploader</th>
                                    <th className="p-3">Views</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVideos.map(video => (
                                    <tr key={video.id} className="border-b border-[var(--border-primary)] last:border-b-0 hover:bg-[var(--background-tertiary)]/50 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 aspect-video bg-black rounded-md overflow-hidden relative flex-shrink-0 group cursor-pointer" onClick={() => navigate(`/watch/${video.id}`, { state: { video } })}>
                                                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <Play className="w-6 h-6 text-white fill-current" />
                                                    </div>
                                                </div>
                                                <div className="max-w-xs">
                                                    <p className="font-bold line-clamp-2">{video.title}</p>
                                                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{new Date(video.uploadDate || Date.now()).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${video.isShort ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                {video.isShort ? 'Short' : 'Video'}
                                            </span>
                                        </td>
                                        <td className="p-3 font-medium">{video.uploaderName}</td>
                                        <td className="p-3 text-[var(--text-secondary)]">{video.views}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/watch/${video.id}`, { state: { video } })}
                                                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"
                                                    title="View"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(video.id, video.title)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
