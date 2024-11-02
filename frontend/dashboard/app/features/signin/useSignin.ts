import { supabase } from "~/lib/supabase";
import { useSession } from "~/features/signin/sessionProvider";
import { useNavigate } from "@remix-run/react";

export const useSignIn = () => {
  const { setSession } = useSession();
  const navigate = useNavigate();

  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const resp = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (resp.error) {
      throw resp.error;
    }

    if (resp.data.session) {
      setSession(resp.data.session);
      navigate("/dashboard");
    }
  };

  return signIn;
};
