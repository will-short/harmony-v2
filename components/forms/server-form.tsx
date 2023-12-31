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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/file-upload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

export const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required." }),
  imageUrl: z.string().min(1, { message: "Server image is required." }),
});

type Props = {
  defaultValues?: z.infer<typeof formSchema>;
  serverId?: string;
};

export default function ServerForm({ defaultValues, serverId }: Props) {
  const router = useRouter();
  const { onClose } = useModal();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      imageUrl: defaultValues?.imageUrl || "",
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
    if (defaultValues) {
      await axios.patch(`/api/servers/${serverId}`, values).catch((err) => {
        console.log(err);
      });
    } else {
      await axios.post("/api/servers", values).catch((err) => {
        console.log(err);
      });
    }

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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      endpoint="serverImage"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-cs font-bold text-zinc-500 dark:text-secondary/70">
                  Server name
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    className="bg-zinc-300/50 border-0 forcus-visible:ring-0 text-black focus-visible:ring-offset-0"
                    placeholder="Enter server name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <Button variant="primary" className="w-full" disabled={isLoading}>
            {defaultValues ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
