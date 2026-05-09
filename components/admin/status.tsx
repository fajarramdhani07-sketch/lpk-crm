"use client";

import { Badge } from "@/components/ui/badge";
import type { CvStatus, FileType, ProfileStatus } from "@/lib/types";

export const cvLabels: Record<CvStatus, string> = {
  pending: "Pending",
  processing: "Diproses",
  done: "Selesai",
  failed: "Gagal",
  stale: "Perlu generate ulang"
};

export const profileLabels: Record<ProfileStatus, string> = {
  draft: "Draft",
  incomplete: "Belum lengkap",
  complete: "Lengkap",
  archived: "Arsip"
};

export const fileLabels: Record<FileType, string> = {
  photo: "Foto",
  document: "Dokumen",
  video: "Video",
  cv: "CV"
};

export function ProfileBadge({ status }: { status: ProfileStatus }) {
  const variant = status === "complete" ? "success" : status === "draft" ? "warning" : status === "archived" ? "muted" : "outline";
  return <Badge variant={variant}>{profileLabels[status]}</Badge>;
}

export function CvBadge({ status }: { status: CvStatus }) {
  const variant = status === "done" ? "success" : status === "failed" ? "danger" : status === "processing" ? "secondary" : status === "stale" ? "warning" : "outline";
  return <Badge variant={variant}>{cvLabels[status]}</Badge>;
}

export function FileBadge({ type }: { type: FileType }) {
  const variant = type === "cv" ? "success" : type === "video" ? "secondary" : type === "photo" ? "warning" : "outline";
  return <Badge variant={variant}>{fileLabels[type]}</Badge>;
}

