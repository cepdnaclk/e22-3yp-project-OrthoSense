"use client";
import * as React from "react";
import { ApiError } from "@/lib/services/api-client";
export function clinicalError(error: unknown): string {
  if(error instanceof ApiError) {
    if(error.status===401) return "Your session expired. Sign in again.";
    if(error.status===403) return "You do not have permission to view this information.";
    if(error.status===404) return "Record not found or unavailable to your account.";
  }
  return error instanceof Error ? error.message : "Unable to load information. Check the connection and retry.";
}
export function useClinicalResource<T>(loader: () => Promise<T>) {
  const [revision,refresh]=React.useReducer((value:number) => value+1,0);
  const [result,setResult]=React.useState<{loader:typeof loader;revision:number;data:T|null;error:string}|null>(null);
  React.useEffect(() => {
    let active=true;
    void loader().then(data => {if(active) setResult({loader,revision,data,error:""});})
      .catch(error => {if(active) setResult({loader,revision,data:null,error:clinicalError(error)});});
    return () => {active=false;};
  },[loader,revision]);
  const current=result?.loader===loader && result.revision===revision ? result : null;
  return {data:current?.data ?? null,error:current?.error ?? "",loading:current===null,refresh};
}
