"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    if (!sent) {
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
      if (otpError) setError(otpError.message);
      else setSent(true);
      return;
    }
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });
    if (verifyError) setError(verifyError.message);
    else {
      router.push("/staff/orders");
      router.refresh();
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Staff sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+1 352 555 0148"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          {sent && (
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            className="w-full"
            disabled={!phone.trim() || (sent && !code.trim())}
            onClick={() => void submit()}
          >
            {sent ? "Verify" : "Send code"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
