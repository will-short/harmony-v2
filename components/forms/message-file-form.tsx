"use client";

import React, { useEffect } from "react";

import * as z from "zod";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/file-upload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

export const formSchema = z.object({
  fileUrl: z.string().min(1, { message: "Attachment is required." }),
});

type Props = {
  defaultValues?: z.infer<typeof formSchema>;
  apiUrl: string;
};

export default function MessageFileForm({ defaultValues, apiUrl }: Props) {
  const router = useRouter();
  const { onClose } = useModal();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: defaultValues?.fileUrl || "",
    },
  });

  // reset form on unmount
  useEffect(() => {
    return () => {
      form.reset();
    };
  }, [form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (
    values
  ) => {
    await axios
      .post(apiUrl, { fileUrl: values.fileUrl, content: values.fileUrl })
      .catch((err) => {
        console.log(err);
      });

    form.reset();
    router.refresh();
    onClose();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8 px-6">
          <div className="flex items-center justify-center text-center">
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      endpoint="messageFile"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <Button variant="primary" className="w-full" disabled={isLoading}>
            Send
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
