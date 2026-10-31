"use client";

import { useActionState } from "react";
import { signIn, type ActionResult } from "@/app/admin/actions";
import { input, label, btn } from "./styles";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(signIn, { ok: false });
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className={label}>Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      {state.message && <p role="alert" className="text-sm text-danger">{state.message}</p>}
      <button disabled={pending} className={`${btn} w-full justify-center`}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
