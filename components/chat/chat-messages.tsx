"use client";

import { Member } from "@prisma/client";
import ChatWelcome from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment, useRef, ElementRef } from "react";
import ChatItem from "./chat-item";
import { MessageWithMemberWithProfile } from "@/types";
import { useChatBroadcast } from "@/hooks/use-chat-broadcast";
import { useChatScroll } from "@/hooks/use-chat-scroll";

type Props = {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  type: "channel" | "conversation";
};

export default function ChatMessages({
  name,
  member,
  chatId,
  apiUrl,
  type,
}: Props) {
  const queryKey = `chat:${chatId}`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const bottomRef = useRef<ElementRef<"div">>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({ queryKey, apiUrl });

  useChatBroadcast({
    queryKey,
    table: type === "channel" ? "Message" : "DirectMessage",
  });
  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center lg:pr-60">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-cs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center lg:pr-60">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-cs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={chatRef}
      className="flex-1 flex flex-col py-4 overflow-y-auto lg:pr-60"
    >
      {!hasNextPage && (
        <>
          <div className="flex-1" />
          <ChatWelcome type={type} name={name} />
        </>
      )}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message: MessageWithMemberWithProfile) => (
              <ChatItem
                key={message.id}
                message={message}
                currentMember={member}
                apiUrl={apiUrl}
              />
            ))}
          </Fragment>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
