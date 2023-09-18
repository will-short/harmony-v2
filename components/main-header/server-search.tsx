"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useParams, useRouter } from "next/navigation";
import { platform } from "os";

type Props = {
  data: {
    label: string;
    type: "channel" | "member";
    data?: {
      icon: React.ReactNode;
      name: string;
      id: string;
    }[];
  }[];
};

export default function ServerSearch({ data }: Props) {
  const [open, setOpen] = useState(false);
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    setIsWindows(navigator?.userAgent?.toLowerCase().includes("window"));
  }, []);

  const router = useRouter();
  const params = useParams();

  const onClick = ({
    id,
    type,
  }: {
    id: string;
    type: "channel" | "member";
  }) => {
    setOpen(false);

    if (type === "member") {
      return router.push(`/servers/${params.serverId}/conversations/${id}`);
    }

    if (type === "channel") {
      return router.push(`/servers/${params.serverId}/channels/${id}`);
    }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);

    return () => {
      document.removeEventListener("keydown", down);
    };
  }, []);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full dark:bg-[#2B2D31] bg-[#F2F3F5] hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
      >
        <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
          Search
        </p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
          <span className="text-xs">{isWindows ? "CTRL" : "⌘"}</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search all channels and members" />
        <CommandList>
          <CommandEmpty> No Results found</CommandEmpty>
          {data.map(({ label, type, data }) => {
            if (!data?.length) return null;

            return (
              <CommandGroup key={label} heading={label}>
                {data?.map(({ icon, name, id }) => (
                  <CommandItem key={id} onSelect={() => onClick({ id, type })}>
                    {icon}
                    <span className="ml-2">{name}</span>
                    <div className="hidden">{id}</div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
