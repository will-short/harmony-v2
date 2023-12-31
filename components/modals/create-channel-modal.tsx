"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChannelForm from "@/components/forms/channel-form";
import { useModal } from "@/hooks/use-modal-store";
import { useParams } from "next/navigation";

export default function CreateChannelModal() {
  const { isOpen, onClose, type, data } = useModal();
  const params = useParams();

  const isModalOpen = type === "createChannel" && isOpen;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Create a channel
          </DialogTitle>
        </DialogHeader>
        <ChannelForm
          serverId={params?.serverId as string}
          defaultValues={{ type: data.channelType }}
        />
      </DialogContent>
    </Dialog>
  );
}
