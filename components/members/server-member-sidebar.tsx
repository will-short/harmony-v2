import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import ServerHeader from "../server/server-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import ServerSearch from "../main-header/server-search";
import { roleIconMap, channelIconMap } from "@/constants";
import { Separator } from "@/components/ui/separator";
import ServerSection from "../server/server-section";
import ServerChannel from "../server/server-channel";
import ServerMember from "../server/server-member";

type Props = {
  serverId: string;
};

export default async function ServerMemberSidebar({ serverId }: Props) {
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

  const members = server.members.filter(
    (member) => member.profileId !== profile.id
  );

  const role = server.members.find((member) => member.profileId === profile.id)
    ?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ScrollArea className="flex-1 px-3">
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Server Members"
            />
            {members.map((member) => (
              <ServerMember key={member.id} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
