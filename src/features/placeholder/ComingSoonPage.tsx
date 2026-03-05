interface Props {
  title: string
}

export default function ComingSoonPage({ title }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-[var(--text-3)] bg-[var(--bg-base)]">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-xl font-semibold text-[var(--text-2)]">{title}</h2>
      <p className="text-sm mt-2">Coming soon</p>
    </div>
  )
}
