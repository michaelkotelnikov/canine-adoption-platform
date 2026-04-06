"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserApiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1).max(120),
  breed: z.string().min(1).max(120),
  age: z.coerce.number().min(0).max(40),
  sex: z.string().min(1).max(32),
  size: z.string().min(1).max(32),
  description: z.string().min(1),
  photo_url: z.string().min(4).max(2048),
  status: z.enum(["available", "adopted"]),
});

type FormValues = z.infer<typeof schema>;

const fieldLabelClass =
  "text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-text-body";

/** Matches [Input] focus and border tokens (design-system formElements). */
const selectFieldClass = cn(
  "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export default function NewDogPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      breed: "",
      age: 1,
      sex: "unknown",
      size: "medium",
      description: "",
      photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
      status: "available",
    },
  });

  async function onSubmit(values: FormValues) {
    const client = createBrowserApiClient();
    const { error, response } = await client.POST("/dogs", { body: values });
    if (error || !response.ok) {
      toast.error("Could not create dog");
      return;
    }
    toast.success("Dog added");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
          Staff
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-primary">
          Add a dog
        </h1>
        <p className="mt-2 text-base text-text-secondary">
          Superuser-only. Photo must be a public image URL.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v) => void onSubmit(v))} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>Breed</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>Age</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>Status</FormLabel>
                  <FormControl>
                    <select className={selectFieldClass} {...field}>
                      <option value="available">available</option>
                      <option value="adopted">adopted</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>Sex</FormLabel>
                <FormControl>
                  <Input placeholder="male / female" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>Size</FormLabel>
                <FormControl>
                  <Input placeholder="small / medium / large" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="photo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>Photo URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="shelter" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Save dog"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
