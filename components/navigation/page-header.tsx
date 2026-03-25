export function PageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-lg mx-auto px-4 py-3">
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
    </header>
  )
}
