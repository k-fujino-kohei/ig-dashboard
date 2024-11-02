import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { useSession } from "~/features/signin/sessionProvider";
import { SignInCard } from "~/features/signin/signInCard";

export default function Login() {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <SignInCard />
    </div>
  );
}
