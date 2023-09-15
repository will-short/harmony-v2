import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

export const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
} as const;

export const channelIconMap = {
  [ChannelType.TEXT]: <Hash className="h-4 w-4 ml-2" />,
  [ChannelType.VOICE]: <Mic className="h-4 w-4 ml-2" />,
  [ChannelType.VIDEO]: <Video className="h-4 w-4 ml-2" />,
} as const;
