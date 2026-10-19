"use client";
import { useRouter } from "next/navigation";
import {
  QrInlineCardEditor,
  type InlineCardEditorProps,
} from "./qr-inline-card-editor";
export function DashboardQrCardEditor(props: InlineCardEditorProps) {
  const router = useRouter();
  return <QrInlineCardEditor {...props} onSaved={() => router.refresh()} />;
}
