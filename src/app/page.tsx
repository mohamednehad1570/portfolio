/**
 * Home page: the one-page site. Server component that lays out the sections;
 * only the sections that need the browser are client components.
 * Order (D13): Hero · About · Projects · Contact · Footer.
 */
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import AboutStack from "@/components/sections/AboutStack";
import { SiteStateProvider } from "@/components/SiteState";
import ToTop from "@/components/ToTop";

export default function Home() {
  return (
    <SiteStateProvider>
      <div className="page">
        <Header />
        <main>
          <Hero />
          <AboutStack />
          <Projects />
          <Contact />
        </main>
        <Footer />
        <ToTop />
      </div>
    </SiteStateProvider>
  );
}
