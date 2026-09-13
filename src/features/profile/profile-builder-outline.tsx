"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import { useState } from "react";

import { IconButton } from "@/components/ui/button";
import { moveProfileBlock } from "@/features/profile/profile-document";
import type {
  ProfileBlock,
  ProfileBlockType,
  ProfileDocument,
} from "@/features/profile/profile-document-types";

export type BuilderSelection = ProfileBlockType | "document";

const labels: Record<ProfileBlockType, string> = {
  bio: "Giới thiệu",
  contact: "Liên hệ",
  identity: "Avatar & Cover",
  social: "Mạng xã hội",
};

export function ProfileBuilderOutline({
  disabled = false,
  document,
  onChange,
  onSelect,
}: {
  disabled?: boolean;
  document: ProfileDocument;
  onChange: (document: ProfileDocument) => void;
  onSelect: (selection: BuilderSelection) => void;
}) {
  const [announcement, setAnnouncement] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const optionalBlocks = document.blocks.filter(
    (block) => block.type !== "identity",
  );

  function handleDragEnd(event: DragEndEvent) {
    if (disabled) return;
    const active = String(event.active.id) as ProfileBlockType;
    const over = event.over
      ? (String(event.over.id) as ProfileBlockType)
      : null;
    if (over) {
      onChange(moveProfileBlock(document, active, over));
      const position = document.blocks.findIndex((block) => block.id === over);
      setAnnouncement(
        `${labels[active]} đã chuyển tới vị trí ${position + 1}.`,
      );
    }
  }

  return (
    <nav aria-label="Cấu trúc hồ sơ" className="grid gap-2">
      <FixedOutlineRow
        disabled={disabled}
        label="Avatar & Cover"
        onClick={() => onSelect("identity")}
      />
      <DndContext
        accessibility={{
          announcements: {
            onDragCancel({ active }) {
              return `Đã huỷ sắp xếp ${labels[String(active.id) as ProfileBlockType]}.`;
            },
            onDragEnd({ active, over }) {
              return over
                ? `${labels[String(active.id) as ProfileBlockType]} đã được thả tại ${labels[String(over.id) as ProfileBlockType]}.`
                : `${labels[String(active.id) as ProfileBlockType]} chưa thay đổi vị trí.`;
            },
            onDragOver({ active, over }) {
              return over
                ? `Đang đưa ${labels[String(active.id) as ProfileBlockType]} qua ${labels[String(over.id) as ProfileBlockType]}.`
                : undefined;
            },
            onDragStart({ active }) {
              return `Bắt đầu sắp xếp ${labels[String(active.id) as ProfileBlockType]}.`;
            },
          },
          screenReaderInstructions: {
            draggable:
              "Nhấn phím cách để bắt đầu. Dùng phím mũi tên để đổi vị trí, phím cách để thả hoặc Escape để huỷ.",
          },
        }}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={optionalBlocks.map((block) => block.id)}
          strategy={verticalListSortingStrategy}
        >
          {optionalBlocks.map((block) => (
            <SortableOutlineRow
              block={block}
              document={document}
              disabled={disabled}
              key={block.id}
              onChange={onChange}
              onSelect={() => onSelect(block.type)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </nav>
  );
}

function FixedOutlineRow({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="grid min-h-12 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center rounded-lg transition-colors hover:bg-muted focus-within:bg-muted">
      <IconButton
        aria-label={`${label} không thể sắp xếp`}
        className="opacity-30"
        disabled
        size="icon-lg"
        tooltip={`${label} không thể sắp xếp`}
        type="button"
        variant="ghost"
      >
        <GripVertical aria-hidden="true" />
      </IconButton>
      <button
        className="min-h-11 min-w-0 rounded-md px-2 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring/60"
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        <span className="block truncate">{label}</span>
      </button>
      <span aria-hidden="true" />
    </div>
  );
}

function SortableOutlineRow({
  block,
  disabled,
  document,
  onChange,
  onSelect,
}: {
  block: Exclude<ProfileBlock, { type: "identity" }>;
  disabled: boolean;
  document: ProfileDocument;
  onChange: (document: ProfileDocument) => void;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ disabled, id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  function toggleVisible(visible: boolean) {
    onChange({
      ...document,
      blocks: document.blocks.map((item) =>
        item.id === block.id ? { ...item, visible } : item,
      ),
    } as ProfileDocument);
  }

  return (
    <div
      className="group grid min-h-12 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center rounded-lg transition-colors hover:bg-muted focus-within:bg-muted"
      ref={setNodeRef}
      style={style}
    >
      <IconButton
        {...attributes}
        {...listeners}
        disabled={disabled}
        size="icon-lg"
        tooltip={`Kéo để sắp xếp ${labels[block.type]}`}
        type="button"
        variant="ghost"
      >
        <GripVertical aria-hidden="true" />
      </IconButton>
      <button
        className="min-h-11 min-w-0 rounded-md px-2 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring/60"
        disabled={disabled}
        onClick={onSelect}
        type="button"
      >
        <span
          className={`block truncate ${block.visible ? "" : "text-muted-foreground"}`}
        >
          {labels[block.type]}
        </span>
      </button>
      <IconButton
        aria-pressed={block.visible}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          toggleVisible(!block.visible);
        }}
        size="icon-lg"
        tooltip={`${block.visible ? "Ẩn" : "Hiện"} ${labels[block.type]}`}
        type="button"
        variant="ghost"
      >
        {block.visible ? (
          <Eye aria-hidden="true" />
        ) : (
          <EyeOff aria-hidden="true" />
        )}
      </IconButton>
    </div>
  );
}
