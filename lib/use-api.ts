"use client";

import { useEffect, useState } from "react";

export type ApiState<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: Error };

/**
 * Memanggil fungsi `lib/api.ts` dari komponen klien.
 * `load` harus stabil (useCallback / fungsi modul); setiap kali identitasnya berubah,
 * state kembali "loading" sampai hasil baru datang.
 */
export function useApi<T>(load: () => Promise<T>): ApiState<T> {
  const [state, setState] = useState<{ load: () => Promise<T>; value: ApiState<T> } | null>(null);

  useEffect(() => {
    let alive = true;
    load().then(
      (data) => alive && setState({ load, value: { status: "success", data } }),
      (error: unknown) =>
        alive &&
        setState({
          load,
          value: { status: "error", error: error instanceof Error ? error : new Error(String(error)) },
        })
    );
    return () => {
      alive = false;
    };
  }, [load]);

  return state && state.load === load ? state.value : { status: "loading" };
}
