"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import ActionTooltip from "@/components/action-tooltip";

type Props = {
  id: string;
  imageUrl: string;
  name: string;
};

export default function NavigationItem({ id, imageUrl, name }: Props) {
  const params = useParams();
  const router = useRouter();

  const onClick = () => {
    router.push(`/servers/${id}`);
  }
  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button onClick={onClick} className="group relative flex items-center">
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-1",
            params?.serverId !== id && "group-hover:h-5",
            params?.serverId === id ? "h-9" : "h-2",
          )}
        />
        <div className={cn("relative group flex mx-3 h-12 w-12 rounded-3xl group-hover:rounded-2xl transaction-all overflow-hidden", params?.serverId === id && "bg-primary/10 rounded-2xl")}>
          <Image fill src={imageUrl} alt="Server"/>
        </div>
      </button>
    </ActionTooltip>
  );
}
