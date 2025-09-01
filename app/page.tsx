import InteractiveSVG from '@/components/InteractiveSVG';

export default function Page() {
  return (
    <main className="flex items-center justify-center bg-gray-100 min-h-screen h-screen w-screen overflow-hidden">
      <InteractiveSVG className="w-full max-w-screen h-auto" />
    </main>
  )
}
