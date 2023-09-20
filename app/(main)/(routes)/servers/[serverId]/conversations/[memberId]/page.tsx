import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import MainHeader from "@/components/main-header/main-header";
import MediaRoom from "@/components/media-room";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

type Props = {
  params: {
    serverId: string;
    memberId: string;
  };
  searchParams: {
    video?: boolean;
  };
};
export default async function page({ params, searchParams }: Props) {
  const profile = await currentProfile();
  if (!profile) {
    return redirectToSignIn();
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    params.memberId
  );

  if (!conversation) {
    return redirect(`/servers/${params.serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember = memberOne.id === currentMember.id ? memberTwo : memberOne;

  const apiUrl = `/api/servers/${params.serverId}/conversations/${conversation.id}/direct-messages`;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <MainHeader
        imageUrl={otherMember.profile.imageUrl}
        pageName={otherMember.profile.name}
        serverId={params.serverId}
        type="conversation"
      />
      {!searchParams.video && (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.profile.name}
            type="conversation"
            apiUrl={apiUrl}
            chatId={conversation.id}
          />
          <ChatInput
            name={otherMember.profile.name}
            type="conversation"
            apiUrl={apiUrl}
          />
        </>
      )}
      {searchParams.video && <MediaRoom chatId={conversation.id} video audio />}
    </div>
  );
}
