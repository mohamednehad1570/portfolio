/**
 * 404 page: one line and a link home. Built into out/404.html, which static hosts serve for unknown URLs.
 */
import Link from "next/link";
import { site } from "@/content/site";

export default function NotFound() {
  return (
    <main className="doc wrap">
      <h1 className="h2">{site.notFound.text}</h1>
      <Link className="text-link" href="/">
        {site.notFound.linkLabel}
      </Link>
    </main>
  );
}
