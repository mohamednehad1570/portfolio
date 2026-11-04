/**
 * Footer: copyright and the Privacy link, nothing else (D19).
 * Why: kept as a server component; the extra right padding on phones (sections.css) keeps the Privacy link
 * clear of the floating go-to-top button.
 */
import Link from "next/link";
import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>{site.footer.copyright}</span>
        <Link className="footer-privacy" href={site.footer.privacy.href}>
          {site.footer.privacy.label}
        </Link>
      </div>
    </footer>
  );
}
