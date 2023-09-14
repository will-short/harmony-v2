"use client";

import { useState, useEffect } from "react";
import CreateServerModal from "./create-server-modal";

export default function InitialModal() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => window.location.reload();
  }, []);

  if (!isMounted) {
    return null;
  }
  return <CreateServerModal isInitial />;
}
