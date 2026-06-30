export default function CafeLoading() {
  return (
    <main
      className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10"
      aria-busy="true"
      aria-label="Loading the menu"
    >
      <div className="mb-10 animate-pulse space-y-3">
        <div className="h-3 w-40 rounded-full bg-muted" />
        <div className="h-10 w-2/3 rounded-lg bg-muted" />
        <div className="h-4 w-1/2 rounded-full bg-muted" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="grid animate-pulse gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 rounded-xl border border-border bg-card/60"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl border border-border bg-card/60" />
      </div>
    </main>
  );
}
