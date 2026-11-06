/**
 * TodoText: renders a sentence and turns every [bracketed] part grey (the `.todo` style).
 * Why: placeholders Mohammed still has to write must stay visibly different from real copy,
 * while the copy itself stays plain text in src/content/site.ts.
 */
export default function TodoText({ text }: { text: string }) {
  // split() with a capture group keeps the [..] pieces, which land at odd indexes
  const parts = text.split(/(\[[^\]]*\])/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="todo">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
