'use client'

import { SessionProvider as SessionProv } from "next-auth/react";
import { ReactNode } from "react";

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProv>
      {children}
    </SessionProv>
  );
}
