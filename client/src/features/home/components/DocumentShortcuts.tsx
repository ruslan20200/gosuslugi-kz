import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { homeSectionLabels, type DocumentShortcut } from "../model/homeContent";
import { documentToneTokens, homeTokens } from "../model/homeTokens";

export function DocumentShortcuts({
  documents,
}: {
  documents: DocumentShortcut[];
}) {
  return (
    <>
      <div className={homeTokens.documentGrid}>
        {documents.map((document) => (
          <DocumentCard key={document.title} document={document} />
        ))}
      </div>

      <div className={homeTokens.documentsLinkRow}>
        <span className={homeTokens.documentsLinkText}>
          {homeSectionLabels.allDocuments}
        </span>
        <ChevronRight className={homeTokens.documentsLinkIcon} size={20} />
      </div>
    </>
  );
}

function DocumentCard({ document }: { document: DocumentShortcut }) {
  const content = (
    <div className={homeTokens.documentCard}>
      <DocumentBadge tone={document.tone} />
      <span className={homeTokens.documentTitle}>
        {document.title}
      </span>
    </div>
  );

  if (!document.href) {
    return content;
  }

  return <Link href={document.href}>{content}</Link>;
}

function DocumentBadge({ tone }: { tone: DocumentShortcut["tone"] }) {
  const classes = documentToneTokens[tone];

  return (
    <div
      className={cn(homeTokens.badgeBase, classes.badge)}
    >
      <div className={homeTokens.badgeCenter}>
        <div
          className={cn(homeTokens.badgeOuterDot, classes.outerDot)}
        >
          <div className={cn(homeTokens.badgeInnerDot, classes.innerDot)} />
        </div>
      </div>
    </div>
  );
}
