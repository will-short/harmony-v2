import { channelIconMap, roleIconMap } from "@/constants";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { Hash, Users } from "lucide-react";
import { redirect } from "next/navigation";
import ServerSearch from "./server-search";
import { Button } from "../ui/button";
import SidebarButton from "./sidebar-button";

type Props = {
  serverId: string;
};

export default async function MainHeader({ serverId }: Props) {
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
    <div className="h-12 w-full border-neutral-200 dark:border-neutral-800 border-b-2 pl-60 flex items-center">
      <div className="ml-3 flex gap-x-1">
        <Hash className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
      </div>
      <div className="ml-auto mr-4 flex gap-x-2">
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
      </div>
    </div>
  );
}
