// Sidebar.tsx
import { Avatar } from "./ui/avatar";

export default function Sidebar() {
  return (
    <aside className="w-64 h-full bg-neutral-100 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col p-4 gap-4">
      <div className="flex items-center gap-3 mb-6">
        <Avatar />
        <span className="font-semibold text-lg">Chatbot</span>
      </div>
      <nav className="flex flex-col gap-2">
        <button className="text-left px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition">
          Home
        </button>
        <button className="text-left px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition">
          History
        </button>
        <button className="text-left px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition">
          Settings
        </button>
      </nav>
    </aside>
  );
}
