import { useBroadcast } from "@/components/providers/broadcast-provider";
import { MessageWithMemberWithProfile } from "@/types";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type Props = {
  table: "Message" | "DirectMessage";
  queryKey: string;
};

export const useChatBroadcast = ({ table, queryKey }: Props) => {
  const { supabase, isConnected } = useBroadcast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isConnected || !supabase) return;

    const postgres = supabase
      .channel(queryKey)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        async (payload) => {
          const message = payload.new as Message;

          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "DELETE"
          ) {
            queryClient.setQueryData([queryKey], (oldData: any) => {
              if (!oldData || !oldData?.pages?.length) {
                return oldData;
              }

              const newData = oldData.pages.map((page: any) => {
                return {
                  ...page,
                  items: page.items.map(
                    (item: MessageWithMemberWithProfile) => {
                      if (item.id === message.id) {
                        return {
                          ...item,
                          deleted: message.deleted,
                          content: message.content,
                          fileUrl: message.fileUrl,
                          updatedAt: message.updatedAt,
                        };
                      }

                      return item;
                    }
                  ),
                };
              });

              return { ...oldData, pages: newData };
            });
          }

          if (payload.eventType === "INSERT") {
            //TODO: figure out how to get the member and profile in 1 go
            const { data: member } = (await supabase
              .from("Member")
              .select(`*`)
              .match({ id: message.memberId })
              .single()) as { data: Member };
            const { data: profile } = (await supabase
              .from("Profile")
              .select(`*`)
              .match({ id: member.profileId })
              .single()) as { data: Profile };

            const newMessage = { ...message, member: { ...member, profile } };

            queryClient.setQueryData([queryKey], (oldData: any) => {
              if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                return {
                  pages: [
                    {
                      items: [newMessage],
                    },
                  ],
                };
              }

              const newData = [...oldData.pages];

              newData[0] = {
                ...newData[0],
                items: [newMessage, ...newData[0].items],
              };

              return {
                ...oldData,
                pages: newData,
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postgres);
    };
  }, [supabase, isConnected, table, queryClient, queryKey]);
};
