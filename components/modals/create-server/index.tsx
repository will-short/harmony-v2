"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateServerForm from "./form";
import { useModal } from "@/hooks/use-modal-store";

type Props = {
  isInitial?: boolean;
};

export default function CreateServerModal({ isInitial }: Props) {
  const { isOpen, onClose, type } = useModal();

  const isModalOpen = type === "createServer" && isOpen;

  return (
    <Dialog open={isInitial || isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Create a server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Your server is where you and your friends hang out. Make yours and
            start talking.
          </DialogDescription>
        </DialogHeader>
        <CreateServerForm isInitial={isInitial} />
      </DialogContent>
    </Dialog>
  );
}
