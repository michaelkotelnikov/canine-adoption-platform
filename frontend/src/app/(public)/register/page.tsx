"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-context";
import { createAnonApiClient, loginWithPassword } from "@/lib/api/client";
import { isStandaloneFrontend } from "@/lib/standalone";

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  if (isStandaloneFrontend()) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="font-display text-3xl font-bold text-primary">Create account</h1>
        <p className="text-sm text-text-secondary">
          Registration is not available in standalone preview. Start the API with{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">make up</code>.
        </p>
        <Button asChild variant="shelterSecondary">
          <Link href="/">Back to dogs</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const client = createAnonApiClient();
      const { error, response } = await client.POST("/auth/register", {
        body: {
          email,
          password,
          is_active: true,
          is_superuser: false,
          is_verified: false,
        },
      });
      if (error || !response.ok) {
        toast.error("Registration failed");
        return;
      }
      toast.success("Account created — signing you in…");
      try {
        const tokens = await loginWithPassword(email, password);
        await setSession(tokens.access_token);
      } catch {
        toast.message("Registered — please log in.");
        router.push("/login");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Create account</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full rounded-full" disabled={pending}>
          {pending ? "Creating…" : "Register"}
        </Button>
      </form>
    </div>
  );
}
