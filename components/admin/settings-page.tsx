"use client";

import { ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRole } from "@/lib/types";

export function SettingsPage({ userName, role }: { userName: string; role: UserRole }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserRound className="h-4 w-4" /> Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between rounded-md border px-3 py-2"><span className="text-muted-foreground">User</span><span className="font-medium">{userName}</span></div>
          <div className="flex justify-between rounded-md border px-3 py-2"><span className="text-muted-foreground">Role</span><span className="font-medium capitalize">{role}</span></div>
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> System Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Settings domain belum memiliki API khusus. Halaman ini disiapkan sebagai tempat konfigurasi role, CV generation defaults, storage, dan audit policy saat backend tersedia.
        </CardContent>
      </Card>
    </div>
  );
}

