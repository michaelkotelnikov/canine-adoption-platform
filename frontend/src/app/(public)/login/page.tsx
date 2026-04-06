"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-context";
import { loginWithPassword } from "@/lib/api/client";
import { isStandaloneFrontend } from "@/lib/standalone";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  if (isStandaloneFrontend()) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="font-display text-3xl font-bold text-primary">Log in</h1>
        <p className="text-sm text-text-secondary">
          Sign-in is not available in standalone preview. Start the API with{" "}
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
      const data = await loginWithPassword(email, password);
      await setSession(data.access_token);
      toast.success("Signed in");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Log in</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
            Register
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full rounded-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
