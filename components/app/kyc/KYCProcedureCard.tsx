"use client";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { supabaseClient } from "@/utils/supabaseClient";
import { useWallet } from "@solana/wallet-adapter-react";

const KYCProcedure = () => {
  const wallet = useWallet();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const session = await supabaseClient.auth.getSession();

    const response = await fetch("/api/issueholaplexkyc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collectionId: process.env.NEXT_PUBLIC_HOLAPLEX_COLLECTION_ID,
        recipientWalletAddress: wallet?.publicKey?.toBase58(),
        creatorWalletAddress: "none",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to mint to collection");
    }

    const data = await response.json();
    return data.mintToCollection.collectionMint;
  }

  return (
    <div>
      <Form {...form}>
        <form
          // @ts-ignore temporary
          onSubmit={form.handleSubmit(form.handleSubmit(onSubmit))}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormDescription>
                  This is full legal name as it appears on your identity
                  document.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@email.com" {...field} />
                </FormControl>
                <FormDescription>This is your email address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};
export default KYCProcedure;

const formSchema = z.object({
  name: z.string().min(4, {
    message: "Your Full Name must be at least 4 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
});
