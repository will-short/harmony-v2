"use client";

import React, { useEffect } from "react";

import * as z from "zod";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const formSchema = z.object({
  content: z.string().min(1, { message: "Message is required." }),
});

type Props = {
  content?: string;
  apiUrl: string;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ChatItemForm({ content, apiUrl, setIsEditing }: Props) {
  console.log(apiUrl);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content || "",
    },
  });

  // reset form on unmount
  useEffect(() => {
    return () => {
      form.reset();
    };
  }, [form]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsEditing]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (
    values
  ) => {
    try {
      await axios.patch(apiUrl, values);
    } catch (e) {
      console.log(e);
    }
    setIsEditing(false);
    router.refresh();
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center w-full gap-x-2 pt-2"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <div className="relative w-full">
                  <Input
                    disabled={isLoading}
                    className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                    placeholder="Edited message"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button size="sm" variant="primary">
          Save
        </Button>
      </form>
      <span className="text-[10px] mt-1 text-zinc-400">
        Press escape to cancel, enter to save
      </span>
    </Form>
  );
}
