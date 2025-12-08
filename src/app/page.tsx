import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-600 to-teal-800 flex flex-col items-center justify-center p-8">
      <main className="text-center">
        {/* Logo/Title */}
        <h1 className="text-6xl font-bold text-white mb-4">
          Kapu Tī 🍵
        </h1>
        <p className="text-2xl text-teal-100 mb-2">
          Te Reo Māori Card Game
        </p>
        <p className="text-lg text-teal-200 mb-12 max-w-md mx-auto">
          Build sentences, empty your hand, or make the tea!
        </p>

        {/* Play Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/play"
            className="inline-block bg-white text-teal-700 text-xl font-bold
                       px-8 py-4 rounded-full shadow-lg
                       hover:bg-teal-50 hover:scale-105
                       transition-all duration-200"
          >
            🎴 Single Player
          </Link>
          <Link
            href="/play/room"
            className="inline-block bg-amber-400 text-amber-900 text-xl font-bold
                       px-8 py-4 rounded-full shadow-lg
                       hover:bg-amber-300 hover:scale-105
                       transition-all duration-200"
          >
            🌐 Play Online
          </Link>
        </div>
        <p className="mt-4 text-teal-200 text-sm">
          Practice solo or play with friends worldwide!
        </p>

        {/* How to Play */}
        <div className="mt-16 bg-white/10 backdrop-blur rounded-2xl p-8 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">How to Play</h2>
          <ol className="text-left text-teal-100 space-y-3">
            <li className="flex items-start gap-3">
              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
              <span>Each player gets 7 color-coded word cards</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
              <span>Build grammatically correct Te Reo sentences</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
              <span>Say it correctly + translate it to play your cards</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
              <span>First to empty their hand wins!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">☕</span>
              <span><strong>Last player holding cards makes tea for everyone!</strong></span>
            </li>
          </ol>
        </div>

        {/* Card Color Legend */}
        <div className="mt-8 text-sm text-teal-200">
          <p className="mb-2">Card Colors:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="bg-purple-400 px-2 py-1 rounded text-white">particles</span>
            <span className="bg-gray-400 px-2 py-1 rounded text-white">articles</span>
            <span className="bg-blue-400 px-2 py-1 rounded text-white">nouns</span>
            <span className="bg-red-400 px-2 py-1 rounded text-white">pronouns</span>
            <span className="bg-green-400 px-2 py-1 rounded text-white">verbs</span>
            <span className="bg-sky-400 px-2 py-1 rounded text-white">adjectives</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-teal-300 text-sm">
        <p>Audio from kupu.maori.nz • Built with AI Kitchen</p>
        <p className="mt-1 text-xs text-teal-400">
          He aha te mea nui o te ao? He tangata, he tangata, he tangata.
        </p>
      </footer>
    </div>
  );
}
