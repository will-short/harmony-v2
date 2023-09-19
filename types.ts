import { Server, Member, Profile, Message } from "@prisma/client";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
};

export type MessageWithMemberWithProfile = Message & {
  member: Member & { profile: Profile };
};
