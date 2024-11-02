import { useNavigate } from "@remix-run/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Session = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
};
type SessionContextType = {
  session?: Session;
  setSession?: (session: Session | undefined) => void;
};

const ctx = createContext<SessionContextType>({});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<SessionContextType["session"]>(() => {
    const session = sessionStorage.getItem("session");
    try {
      return JSON.parse(session ?? "");
    } catch {
      return undefined;
    }
  });

  useEffect(() => {
    sessionStorage.setItem("session", JSON.stringify(session));
  }, [session]);

  return (
    <ctx.Provider value={{ session, setSession }}>{children}</ctx.Provider>
  );
};

export const useSession = () => {
  const { session, setSession: __setSession } = useContext(ctx);
  const navigate = useNavigate();

  const setSession = useCallback((s: Session | undefined) => {
    __setSession?.(s);
  }, []);

  useEffect(() => {
    console.log("changed", session);
    if (!session) return;
    if (
      session.expires_at &&
      session.expires_at * 1000 < new Date().getTime()
    ) {
      setSession(undefined);
      navigate("/signin");
    }
  }, [session]);

  return { session, setSession };
};
