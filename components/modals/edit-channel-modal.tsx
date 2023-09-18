"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChannelForm from "@/components/forms/channel-form";
import { useModal } from "@/hooks/use-modal-store";

export default function EditChannelModal() {
  const { isOpen, onClose, type, data } = useModal();
  const { channel, server } = data;

  const isModalOpen = type === "editChannel" && isOpen;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit channel
          </DialogTitle>
        </DialogHeader>
        <ChannelForm
          serverId={server?.id}
          channelId={channel?.id}
          defaultValues={{ type: channel?.type, name: channel?.name }}
        />
      </DialogContent>
    </Dialog>
  );
}
