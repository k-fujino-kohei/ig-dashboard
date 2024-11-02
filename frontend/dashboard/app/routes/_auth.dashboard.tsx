import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Charts } from "~/components/charts";
import { useSession } from "~/features/signin/sessionProvider";
import { useSignout } from "~/features/signin/useSignout";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { FollowersTable } from "~/features/dashboard/table";
import { fetchFollowers, Followers } from "~/features/api/followers";
import { HandIcon } from "lucide-react";

export const meta: MetaFunction = () => {
  return [{ title: "IGDashboard" }];
};

export default function Index() {
  const { session } = useSession();
  const signout = useSignout();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<Followers[]>([]);

  useEffect(() => {
    if (!session) {
      navigate("/signin");
      return;
    }

    (async () => {
      try {
        const followers = await fetchFollowers(session.access_token);
        setFollowers(followers);
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex gap-3 h-screen flex-col">
        <div className="flex-1 h-1/3 w-full">
          <Charts followers={followers} />
        </div>
        <div className="h-[calc(60% - 8px)] w-full overflow-y-auto">
          <FollowersTable followers={followers} />
        </div>
        <Button onClick={signout} className="w-28">
          またね
          <HandIcon size="16" />
        </Button>
      </div>
    </div>
  );
}
