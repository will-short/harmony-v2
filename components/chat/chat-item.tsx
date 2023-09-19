"use client";

import { MessageWithMemberWithProfile } from "@/types";
import { Member, MemberRole } from "@prisma/client";
import { format } from "date-fns";
import UserAvatar from "@/components/user-avatar";
import ActionTooltip from "@/components/action-tooltip";
import { roleIconMap } from "@/constants";
import Image from "next/image";
import { Edit, FileIcon, Trash } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ChatItemForm from "@/components/forms/chat-item-form";
import { useRouter, useParams } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

const DATE_FORMAT = "d MMM yyy, HH:mm";

type Props = {
  message: MessageWithMemberWithProfile;
  currentMember: Member;
  apiUrl: string;
};

export default function ChatItem({ message, currentMember, apiUrl }: Props) {
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  const timestamp = format(new Date(message.createdAt), DATE_FORMAT);
  const isUpdated = message.updatedAt !== message.createdAt;
  const fileType = message.fileUrl?.split(".").pop();
  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === message.memberId;
  const canDeleteMessage =
    !message.deleted && (isAdmin || isOwner || isModerator);
  const canEditMessage = !message.deleted && isOwner && !message.fileUrl;
  const isPdf = fileType === "pdf" && message.fileUrl;

  const onMemberClick = () => {
    if (message.member.id === currentMember.id) {
      return;
    }
    router.push(
      `/server/${params.serverId}/conversations/${message.member.id}`
    );
  };

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div
          className="cursor-pointer hover:drop-shadow-md transition"
          onClick={onMemberClick}
        >
          <UserAvatar src={message.member.profile.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                className="font-semibold text-sm hover:underline cursor-pointer"
                onClick={onMemberClick}
              >
                {message.member.profile.name}
              </p>
              <ActionTooltip label={message.member.role}>
                {roleIconMap[message.member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {!isPdf && !!message.fileUrl && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={message.fileUrl}
                alt={message.content}
                fill
                className="object-fill"
              />
            </a>
          )}
          {isPdf && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={message.fileUrl || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                PDF File
              </a>
            </div>
          )}
          {!message.fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                message.deleted &&
                  "itealic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {message.content}
              {isUpdated && !message.deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!message.fileUrl && isEditing && (
            <ChatItemForm
              content={message.content}
              apiUrl={`${apiUrl}/${message.id}`}
              setIsEditing={setIsEditing}
            />
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              onClick={() =>
                onOpen("deleteMessage", { apiUrl: `${apiUrl}/${message.id}` })
              }
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
}
