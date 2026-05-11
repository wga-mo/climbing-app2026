export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex h-14 items-center justify-between px-4">
        <div className="text-lg font-bold">
          Climbing Database
        </div>

        <button className="rounded-md border px-3 py-1 text-sm">
          Menu
        </button>
      </nav>
    </header>
  );
}