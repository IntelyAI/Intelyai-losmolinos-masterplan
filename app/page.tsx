import InteractiveSVG from './components/InteractiveSVG';

export default function Page() {
  return (
    <main className="flex items-center justify-center h-screen bg-gray-100">
      <InteractiveSVG className="w-full max-w-5xl h-auto" />
    </main>
  )
}
