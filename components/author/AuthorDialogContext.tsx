"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthorContext, ResolvedAuthorProfile } from "@/types";
import { AuthorPopup } from "@/components/author/AuthorPopup";

interface AuthorDialogContextValue {
  author: ResolvedAuthorProfile;
  context: AuthorContext;
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  setOpen: (open: boolean) => void;
}

const AuthorDialogContext = createContext<AuthorDialogContextValue | null>(
  null
);

interface AuthorDialogProviderProps {
  author: ResolvedAuthorProfile;
  context: AuthorContext;
  children: ReactNode;
}

export function AuthorDialogProvider({
  author,
  context,
  children,
}: AuthorDialogProviderProps) {
  const [open, setOpen] = useState(false);

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      author,
      context,
      open,
      openDialog,
      closeDialog,
      setOpen,
    }),
    [author, context, open, openDialog, closeDialog]
  );

  return (
    <AuthorDialogContext.Provider value={value}>
      {children}
      <AuthorPopup />
    </AuthorDialogContext.Provider>
  );
}

export function useAuthorDialog(): AuthorDialogContextValue {
  const value = useContext(AuthorDialogContext);
  if (!value) {
    throw new Error("useAuthorDialog must be used within AuthorDialogProvider");
  }
  return value;
}
