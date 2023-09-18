import { channelIconMap, roleIconMap } from "@/constants";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { Hash, Menu, Users } from "lucide-react";
import { redirect } from "next/navigation";
import ServerSearch from "./server-search";
import SidebarButton from "./sidebar-button";
import { ModeToggle } from "@/components/mode-toggle";
import MobileToggle from "@/components/mobile-toggle";
import UserAvatar from "../user-avatar";

type Props = {
  serverId: string;
  pageName: string;
  type: "channel" | "conversation";
  imageUrl?: string;
};

export default async function MainHeader({
  serverId,
  pageName,
  type,
  imageUrl,
}: Props) {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  if (!server) {
    redirect("/");
  }

  const textChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.VOICE
  );
  const videoChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );

  const members = server.members.filter(
    (member) => member.profileId !== profile.id
  );

  return (
    <div className="h-12 w-full border-neutral-200 dark:border-neutral-800 border-b-2 flex items-center font-semibold text-base">
      <MobileToggle serverId={serverId} />
      <div className="ml-3 flex items-center gap-x-2">
        {type === "channel" ? (
          <Hash className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        ) : (
          <UserAvatar src={imageUrl} className="h-8 w-8 md:h-8 md:w-8" />
        )}
        <span className="text-base font-semibold text-black dark:text-white">
          {pageName}
        </span>
      </div>
      <div className="ml-auto mr-4 flex gap-x-4">
        <SidebarButton />
        <ServerSearch
          data={[
            {
              label: "Text Channels",
              type: "channel",
              data: textChannels?.map((channel) => ({
                id: channel.id,
                name: channel.name,
                icon: channelIconMap[channel.type],
              })),
            },
            {
              label: "Voice Channels",
              type: "channel",
              data: audioChannels?.map((channel) => ({
                id: channel.id,
                name: channel.name,
                icon: channelIconMap[channel.type],
              })),
            },
            {
              label: "Video Channels",
              type: "channel",
              data: videoChannels?.map((channel) => ({
                id: channel.id,
                name: channel.name,
                icon: channelIconMap[channel.type],
              })),
            },
            {
              label: "Members",
              type: "member",
              data: members?.map((member) => ({
                id: member.id,
                name: member.profile.name,
                icon: roleIconMap[member.role],
              })),
            },
          ]}
        />
        <ModeToggle />
      </div>
    </div>
  );
}
