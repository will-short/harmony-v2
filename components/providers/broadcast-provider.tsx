"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

type BroadcastType = {
  supabase: any | null;
  isConnected: boolean;
};

const Broadcast = createContext<BroadcastType>({
  supabase: null,
  isConnected: false,
});

export const useBroadcast = () => {
  return useContext(Broadcast);
};

export const BroadcastProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchTokenAndConnect = async () => {
      const token = await getToken({ template: "supabase" });
      const supabaseConnection = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_KEY as string,
        {
          global: {
            headers: { Authorization: `Bearer ${token}` },
          },
        }
      );

      setSupabase(supabaseConnection);
      setIsConnected(true);
    };
    fetchTokenAndConnect();
  }, [getToken]);

  return (
    <Broadcast.Provider value={{ supabase, isConnected }}>
      {children}
    </Broadcast.Provider>
  );
};
