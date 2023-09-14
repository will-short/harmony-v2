import { useState, useEffect } from "react";

export const useOrigin = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const origin = window?.location?.origin ? window.location.origin : "";

  if (!isMounted) {
    return "";
  }

  return origin;
};
