import InteractiveSVG from '@/components/InteractiveSVG';

export default function Page() {
  return (
    <main className="flex items-center justify-center bg-gray-100 min-h-[100dvh] h-[100dvh] w-screen overflow-auto sm:overflow-hidden">
      <InteractiveSVG className="w-full max-w-screen h-auto" />
    </main>
  )
}
