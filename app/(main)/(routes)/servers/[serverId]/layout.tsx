import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import ServerSidebar from "@/components/server/server-sidebar";
import ServerMemberSidebar from "@/components/members/server-member-sidebar";

type Props = {
  children: React.ReactNode;
  params: { serverId: string };
};

export default async function layout({ children, params }: Props) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn;
  }

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: { some: { profileId: profile.id } },
    },
  });

  if (!server) {
    return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar serverId={server.id} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 right-0 mt-12">
        <ServerMemberSidebar serverId={server.id} />
      </div>
    </div>
  );
}
