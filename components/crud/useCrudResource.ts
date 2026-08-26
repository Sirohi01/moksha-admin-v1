"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiRequestError } from "@/lib/api";
import { FieldError } from "@/lib/formErrors";

export interface CrudResourceApi<T, TCreate, TUpdate = Partial<TCreate>> {
  list: () => Promise<T[]>;
  create: (input: TCreate) => Promise<T>;
  update: (id: string, input: TUpdate) => Promise<T>;
  remove?: (id: string) => Promise<unknown>;
}

interface CrudMessages {
  save: string;
  remove?: string;
}

export function useCrudResource<T, TCreate, TUpdate = Partial<TCreate>>(
  resourceApi: CrudResourceApi<T, TCreate, TUpdate>,
  messages: CrudMessages,
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  const updateError = (message: string) => {
    setError(message);
    if (!message) setFieldErrors([]);
  };

  const load = useCallback(() => {
    setLoading(true);
    return resourceApi.list().then(setRows).catch(() => undefined).finally(() => setLoading(false));
  }, [resourceApi]);

  useEffect(() => { void load(); }, [load]);

  const save = async (id: string | null, input: TCreate, updateInput?: TUpdate) => {
    setSaving(true);
    updateError("");
    try {
      if (id) await resourceApi.update(id, updateInput ?? input as unknown as TUpdate);
      else await resourceApi.create(input);
      void load();
      return true;
    } catch (err) {
      setFieldErrors(err instanceof ApiRequestError ? err.fieldErrors ?? [] : []);
      setError(err instanceof ApiRequestError ? err.message : messages.save);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!resourceApi.remove) return false;
    setSaving(true);
    updateError("");
    try {
      await resourceApi.remove(id);
      void load();
      return true;
    } catch (err) {
      setFieldErrors(err instanceof ApiRequestError ? err.fieldErrors ?? [] : []);
      setError(err instanceof ApiRequestError ? err.message : messages.remove ?? "Could not remove item.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { rows, loading, saving, error, setError: updateError, fieldErrors, load, save, remove };
}
