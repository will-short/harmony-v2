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
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { ChannelType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Channel name is required." })
    .refine((name) => name !== "general", {
      message: "Channel name cannot be 'general'.",
    }),
  type: z.nativeEnum(ChannelType),
});

type Props = {
  defaultValues?: { name?: string; type?: ChannelType };
  serverId?: string;
  channelId?: string;
};

export default function ChannelForm({
  defaultValues,
  serverId,
  channelId,
}: Props) {
  const router = useRouter();
  const { onClose } = useModal();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || ChannelType.TEXT,
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
    try {
      if (defaultValues?.name) {
        await axios.patch(
          `/api/servers/${serverId}/channels/${channelId}`,
          values
        );
      } else {
      await axios.post(`/api/servers/${serverId}/channels`, values);
      }
    } catch (e) {
      console.log(e);
    }
    form.reset();
    router.refresh();
    onClose();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8 px-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-cs font-bold text-zinc-500 dark:text-secondary/70">
                  Channel name
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    className="bg-zinc-300/50 border-0 forcus-visible:ring-0 text-black focus-visible:ring-offset-0"
                    placeholder="Enter channel name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel Type</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                      <SelectValue placeholder="Select a channel type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ChannelType).map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="capitalize"
                      >
                        {type.toLocaleLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <Button variant="primary" className="w-full" disabled={isLoading}>
            {defaultValues?.name ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
