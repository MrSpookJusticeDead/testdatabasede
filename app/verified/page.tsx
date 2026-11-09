export default function VerifiedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-emerald-500 mb-4">Email Verified!</h1>
        <p className="text-zinc-400 mb-6">Your email has been successfully verified.</p>
        <a 
          href="/"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
        >
          Go to Chat
        </a>
      </div>
    </div>
  );
}