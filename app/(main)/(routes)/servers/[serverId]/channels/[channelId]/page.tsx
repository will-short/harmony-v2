import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import MainHeader from "@/components/main-header/main-header";
import MediaRoom from "@/components/media-room";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";

type Props = {
  params: {
    serverId: string;
    channelId: string;
  };
};
export default async function page({ params }: Props) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const channel = await db.channel.findUnique({
    where: {
      id: params.channelId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      profileId: profile.id,
      serverId: params.serverId,
    },
  });

  if (!channel || !member) {
    redirect("/");
  }

  const apiUrl = `/api/servers/${params.serverId}/channels/${channel.id}/messages`;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <MainHeader
        serverId={params.serverId}
        pageName={channel.name}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            member={member}
            name={channel.name}
            type="channel"
            apiUrl={apiUrl}
            chatId={channel.id}
          />
          <ChatInput name={channel.name} type="channel" apiUrl={apiUrl} />
        </>
      )}
      {channel.type === ChannelType.VOICE && (
        <MediaRoom chatId={channel.id} video={false} audio />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} video audio />
      )}
    </div>
  );
}
