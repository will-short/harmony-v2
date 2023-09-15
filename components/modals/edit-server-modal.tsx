"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServerForm from "@/components/forms/server-form";
import { useModal } from "@/hooks/use-modal-store";

export default function CreateServerModal() {
  const { isOpen, onClose, type, data } = useModal();
  const { server } = data;

  const isModalOpen = type === "editServer" && isOpen;

  if (!server) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Your server is where you and your friends hang out. Make yours and
            start talking.
          </DialogDescription>
        </DialogHeader>
        <ServerForm
          serverId={server.id}
          defaultValues={{ name: server.name, imageUrl: server.imageUrl }}
        />
      </DialogContent>
    </Dialog>
  );
}
