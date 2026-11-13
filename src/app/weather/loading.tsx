export default function Loading() {
  return (
    <div className="min-h-full flex-1 bg-gradient-to-br from-sky-400 via-sky-500 to-blue-700">
      <div className="mx-auto grid max-w-5xl animate-pulse gap-4 px-4 py-24 md:grid-cols-2">
        <div className="h-64 rounded-2xl bg-white/15 md:col-span-2" />
        <div className="h-36 rounded-2xl bg-white/15 md:col-span-2" />
        <div className="h-56 rounded-2xl bg-white/15" />
        <div className="h-56 rounded-2xl bg-white/15" />
      </div>
    </div>
  );
}
