import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Heart, Music, Search, X, Pencil, Trash2 } from "lucide-react";
import { useSongsSelectors, useSongsActions } from "../../../stores/songsData";
import type { Song } from "../../../stores/songsData";
import { EditSongDialog } from "../dialogs/EditPlaylistDialog";
import { DeleteSongDialog } from "../dialogs/DeletePlaylistDialog";

const SONGS_PER_PAGE = 5;

interface PlayListWidgetProps {
  title: string;
  subtitle: string;
  themeColor: string;
  ownerName: string;
  isGirlfriend: boolean; // true for girlfriend's songs, false for boyfriend's songs
}

const PlayListWidget: React.FC<PlayListWidgetProps> = ({
  title,
  subtitle,
  themeColor,
  ownerName,
  isGirlfriend,
}) => {
  const { 
    isLoading, 
    error,
    isInitialized,
    getGirlfriendSongs,
    getBoyfriendSongs 
  } = useSongsSelectors();
  const { fetchSongs, updateSong, deleteSong } = useSongsActions();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit / Delete dialog state
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);

  const handleSaveEdit = async (id: number, title: string, description: string) => {
    await updateSong(id, {
      title: title.trim() || null,
      description: description.trim() || null,
    });
    setEditingSong(null);
  };

  const handleConfirmDelete = async (id: number) => {
    await deleteSong(id);
    setDeletingSong(null);
    // If last song on page, go to previous page
    if (paginatedSongs.length === 1 && safePage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  // Fetch songs on component mount
  useEffect(() => {
    if (!isInitialized) {
      fetchSongs();
    }
  }, [fetchSongs, isInitialized]);

  // Filter songs based on is_girlfriend entity
  const allFilteredSongs = isGirlfriend ? getGirlfriendSongs() : getBoyfriendSongs();

  // Apply search filter
  const searchedSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allFilteredSongs;
    return allFilteredSongs.filter(
      (song) =>
        song.title?.toLowerCase().includes(q) ||
        song.description?.toLowerCase().includes(q)
    );
  }, [allFilteredSongs, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(searchedSongs.length / SONGS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * SONGS_PER_PAGE;
  const paginatedSongs = searchedSongs.slice(pageStart, pageStart + SONGS_PER_PAGE);

  // Global index for track numbering (across all pages)
  const pageOffset = pageStart;

  // Build visible page numbers with ellipsis
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, "ellipsis", totalPages];
    if (safePage >= totalPages - 2) return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
    return [1, "ellipsis", safePage, "ellipsis", totalPages];
  };

  if (isLoading) {
    return (
      <Card 
        className="h-full shadow-lg flex items-center justify-center"
        style={{ borderColor: themeColor, background: 'white' }}
      >
        <CardContent className="text-center py-12">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: themeColor }}
          ></div>
          <p className="text-gray-500">Loading songs...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card 
        className="h-full shadow-lg"
        style={{ borderColor: themeColor, background: 'white' }}
      >
        <CardContent className="text-center py-12">
          <p className="text-red-500 mb-2">Error loading songs</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="h-full shadow-lg"
      style={{ borderColor: themeColor, background: 'white' }}
    >
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-3">
          <div
            className="p-3 rounded-full"
            style={{
              backgroundColor: `${themeColor}15`,
              border: `2px solid ${themeColor}30`,
            }}
          >
            <Music size={32} color={themeColor} />
          </div>
        </div>
        
        <CardTitle 
          className="flex items-center justify-center gap-2"
          style={{ 
            color: themeColor,
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
          }}
        >
          <Heart size={20} fill={themeColor} color={themeColor} />
          {title}
          <Heart size={20} fill={themeColor} color={themeColor} />
        </CardTitle>
        
        <p 
          className="text-gray-600 mt-2"
          style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
        >
          {subtitle}
        </p>
        
        <Badge 
          variant="secondary"
          className="mx-auto mt-2"
          style={{
            backgroundColor: `${themeColor}20`,
            color: themeColor,
            fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)",
          }}
        >
          {ownerName}'s Favorites · {allFilteredSongs.length} song{allFilteredSongs.length !== 1 ? 's' : ''}
        </Badge>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: themeColor }}
          />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search songs..."
            className="pl-8 pr-8 h-8 text-sm focus-visible:ring-0"
            style={{
              borderColor: `${themeColor}40`,
              fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            >
              <X size={13} style={{ color: themeColor }} />
            </button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 pb-3">
        {/* Song List */}
        {paginatedSongs.map((song, idx) => {
          const globalIndex = pageOffset + idx;
          return (
            <div 
              key={song.id}
              className="p-3 rounded-lg transition-all duration-300 border group"
              style={{
                borderColor: globalIndex === 0 ? themeColor : '#e5e7eb',
                backgroundColor: globalIndex === 0 ? `${themeColor}10` : 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${themeColor}40`;
                e.currentTarget.style.backgroundColor = `${themeColor}08`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = globalIndex === 0 ? themeColor : '#e5e7eb';
                e.currentTarget.style.backgroundColor = globalIndex === 0 ? `${themeColor}10` : 'transparent';
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span
                    className="text-xs font-bold shrink-0 w-6 text-center"
                    style={{ color: themeColor }}
                  >
                    {globalIndex + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-medium text-gray-800 truncate group-hover:text-gray-900"
                      style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                    >
                      {song.title || 'Untitled'}
                    </h4>
                    <p 
                      className="text-gray-600 truncate"
                      style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)" }}
                    >
                      {song.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  {song.audio_src && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: themeColor, color: themeColor }}
                    >
                      Audio
                    </Badge>
                  )}
                  {globalIndex === 0 && (
                    <Heart
                      size={14}
                      fill={themeColor}
                      color={themeColor}
                      className="animate-pulse"
                    />
                  )}
                  {/* Edit / Delete — GF side only */}
                  {isGirlfriend && (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => setEditingSong(song)}
                        title="Edit song"
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                      >
                        <Pencil size={12} style={{ color: themeColor }} />
                      </button>
                      <button
                        onClick={() => setDeletingSong(song)}
                        title="Delete song"
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* No results */}
        {searchedSongs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Music size={48} className="mx-auto mb-4 opacity-30" />
            {searchQuery ? (
              <>
                <p style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}>
                  No songs match "{searchQuery}"
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                  className="text-sm mt-2 underline hover:opacity-70"
                  style={{ color: themeColor, fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)" }}
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}>No songs added yet</p>
                <p className="text-sm mt-1" style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)" }}>
                  Add some songs to see them here! 💝
                </p>
              </>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-2">
            <Pagination>
              <PaginationContent className="flex-wrap gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={`cursor-pointer h-7 text-xs ${safePage === 1 ? 'pointer-events-none opacity-40' : ''}`}
                    style={{ color: themeColor }}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, i) =>
                  page === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis className="h-7 w-7" />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={safePage === page}
                        onClick={() => setCurrentPage(page)}
                        className="cursor-pointer h-7 w-7 text-xs"
                        style={
                          safePage === page
                            ? { backgroundColor: themeColor, color: 'white', borderColor: themeColor }
                            : { color: themeColor }
                        }
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={`cursor-pointer h-7 text-xs ${safePage === totalPages ? 'pointer-events-none opacity-40' : ''}`}
                    style={{ color: themeColor }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <p
              className="text-center mt-1"
              style={{ color: '#999', fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)" }}
            >
              {searchedSongs.length} song{searchedSongs.length !== 1 ? 's' : ''} · page {safePage} of {totalPages}
            </p>
          </div>
        )}
      </CardContent>

      {/* ── Edit & Delete Dialogs (GF only) ── */}
      <EditSongDialog
        key={editingSong?.id}
        song={editingSong}
        themeColor={themeColor}
        onClose={() => setEditingSong(null)}
        onSave={handleSaveEdit}
      />
      <DeleteSongDialog
        song={deletingSong}
        onClose={() => setDeletingSong(null)}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
};

export default PlayListWidget;
