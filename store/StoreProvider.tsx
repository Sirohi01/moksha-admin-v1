"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore, AUTH_STORAGE_KEY, SCOPE_STORAGE_KEY } from "./store";
import { hydrate } from "./slices/authSlice";
import { hydrateScope } from "./slices/scopeSlice";
import { setTokens } from "@/lib/api";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    const scopeRaw = localStorage.getItem(SCOPE_STORAGE_KEY);
    if (scopeRaw) {
      try {
        store.dispatch(hydrateScope(JSON.parse(scopeRaw)));
      } catch {
        localStorage.removeItem(SCOPE_STORAGE_KEY);
        store.dispatch(hydrateScope(null));
      }
    } else {
      store.dispatch(hydrateScope(null));
    }

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setTokens({ accessToken: parsed.accessToken, refreshToken: parsed.refreshToken });
        store.dispatch(hydrate(parsed));
        return;
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    store.dispatch(hydrate(null));
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
