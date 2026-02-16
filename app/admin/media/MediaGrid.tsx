"use client";

import { MediaCard } from "./MediaCard";
import type { ListItem } from "./media.types";
import type { MediaItem } from "./media.types";

type Props = {
  listItems: ListItem[];
  selectMode: boolean;
  bulkSelectMode: boolean;
  selectedIds: Set<string>;
  copiedId: string | null;
  deletingId: string | null;
  retryingId: string | null;
  onToggleSelect: (id: string) => void;
  onSelectItem: (url: string) => void;
  onCopyUrl: (url: string, id: string) => void;
  onDelete: (item: MediaItem) => void;
  onEdit: (id: string) => void;
  onRetry: (id: string) => void;
};

export function MediaGrid({
  listItems,
  selectMode,
  bulkSelectMode,
  selectedIds,
  copiedId,
  deletingId,
  retryingId,
  onToggleSelect,
  onSelectItem,
  onCopyUrl,
  onDelete,
  onEdit,
  onRetry,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {listItems.map((listItem) => (
        <MediaCard
          key={listItem.type === "upload" ? listItem.item.tempId : listItem.item.id}
          listItem={listItem}
          selectMode={selectMode}
          bulkSelectMode={bulkSelectMode}
          selectedIds={selectedIds}
          copiedId={copiedId}
          deletingId={deletingId}
          retryingId={retryingId}
          onToggleSelect={onToggleSelect}
          onSelectItem={onSelectItem}
          onCopyUrl={onCopyUrl}
          onDelete={onDelete}
          onEdit={onEdit}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}
