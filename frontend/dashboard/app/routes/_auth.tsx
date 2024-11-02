import { Outlet } from "@remix-run/react";
import { SessionProvider } from "~/features/signin/sessionProvider";

export default function App() {
  return (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  );
}
