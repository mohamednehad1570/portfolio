/**
 * Home page (temporary stub until Part 6): cubes background plus text in both fonts and every type style,
 * so the tokens and fonts can be checked on their own.
 */
import CubesLayer from "@/components/CubesLayer";

export default function Home() {
  return (
    <main style={{ position: "relative", zIndex: 1, padding: 40 }}>
      <CubesLayer lineAlpha={0.22} />
      <p className="eyebrow">Eyebrow</p>
      <h1 className="h1">Websites that are fast, clear and built to last.</h1>
      <h2 className="h2">Section title</h2>
      <h3 className="h3">Card title</h3>
      <p className="lead">Lead paragraph in the body font.</p>
      <p className="body">
        Body text. <span className="todo">[Placeholder.]</span>
      </p>
    </main>
  );
}
