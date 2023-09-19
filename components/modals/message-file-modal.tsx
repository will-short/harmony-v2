"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import MessageFileForm from "@/components/forms/message-file-form";

export default function MessageFileModal() {
  const { isOpen, onClose, type, data } = useModal();
  const { apiUrl } = data;

  const isModalOpen = type === "messageFile" && isOpen;

  if (!apiUrl) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <MessageFileForm apiUrl={apiUrl} />
      </DialogContent>
    </Dialog>
  );
}
