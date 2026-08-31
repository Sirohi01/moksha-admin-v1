"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { authApi } from "@/lib/authApi";
import { updateAdmin } from "@/store/slices/authSlice";
import Spinner from "@/components/ui/Spinner";
export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { admin, hydrated } = useAppSelector((state) => state.auth);
  const [checked, setChecked] = useState(false);
  const adminId = admin?.id;

  useEffect(() => {
    if (!hydrated) return;
    if (!adminId) {
      router.replace("/login");
      return;
    }
    authApi
      .getMe()
      .then((me) => {
        if (me.twoFactorPending) {
          router.replace("/login");
        } else {
          dispatch(updateAdmin({ roleSlug: me.roleSlug, permissions: me.permissions, isSuperAdmin: me.isSuperAdmin }));
          setChecked(true);
        }
      })
      .catch(() => router.replace("/login"));
  }, [hydrated, adminId, router, dispatch]);

  if (!hydrated || !admin || !checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-bg">
        <Spinner label="Checking session..." />
      </div>
    );
  }

  return <>{children}</>;
}
