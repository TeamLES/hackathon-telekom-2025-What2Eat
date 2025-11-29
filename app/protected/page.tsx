import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return data.claims.email || "No email";
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">
            Prihlásený ako: <Suspense fallback="Načítavam..."><UserDetails /></Suspense>
          </p>
        </div>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Tvoj jedálniček</h2>
        <p className="text-muted-foreground">Obsah bude doplnený...</p>
      </div>
    </div>
  );
}
