import { supabase } from "~/lib/supabase";
import { useSession } from "./sessionProvider";
import { useNavigate } from "@remix-run/react";

export const useSignout = () => {
  const { setSession } = useSession();
  const navigate = useNavigate();

  const signout = async () => {
    await supabase.auth.signOut();
    setSession(undefined);
    navigate("/signin");
  };

  return signout;
};
