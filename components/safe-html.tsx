import DOMPurify from "dompurify";
import { memo } from "react";


 const SANITIZE_CONFIG = {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "b", "i", "u",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "code", "pre", "a",
    ],
    ALLOWED_ATTR: ["href", "title"],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^https?:\/\/|^mailto:|^tel:/,
  }

export const SafeHtml = memo(({ html }: { html: string }) => {
    const sanitizedHtml = DOMPurify.sanitize(html, SANITIZE_CONFIG);
  
    return (
      <div
        className="max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  });