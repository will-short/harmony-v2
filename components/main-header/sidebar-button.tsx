"use client";

import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function SidebarButton() {
  const [isOpen, setIsOpen] = useState(true);

  // in a useEffect to ensure only ran in the browser
  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      if (!isOpen) {
        sidebar.style.display = "none";
      } else {
        sidebar.style.display = "flex";
      }
    }
  }, [isOpen]);

  const onClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <button
      className={cn(
        "text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition",
        isOpen && "text-zinc-600 dark:text-zinc-300"
      )}
      onClick={onClick}
    >
      <Users className="h-5 w-5" />
    </button>
  );
}
