import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

interface SanitizedHTMLProps {
  html: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

/**
 * SanitizedHTML
 * Safely renders HTML content by stripping out potentially malicious scripts
 * and attributes using DOMPurify.
 */
export function SanitizedHTML({ 
  html, 
  className, 
  tag: Tag = "div" 
}: SanitizedHTMLProps) {
  // Configure DOMPurify to allow essential formatting tags
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", 
      "span", "h1", "h2", "h3", "u", "s", "blockquote"
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
  });

  return (
    <Tag
      className={cn("sanitized-content", className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
