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

type Props = {
  isInitial?: boolean;
};

export default function CreateChannelModal({ isInitial }: Props) {
  const { isOpen, onClose, type } = useModal();
  const params = useParams();

  const isModalOpen = type === "createChannel" && isOpen;

  return (
    <Dialog open={isInitial || isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Create a channel
          </DialogTitle>
        </DialogHeader>
        <ChannelForm serverId={params?.serverId as string} />
      </DialogContent>
    </Dialog>
  );
}
