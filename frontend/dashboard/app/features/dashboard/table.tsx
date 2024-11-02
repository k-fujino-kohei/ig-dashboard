import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

import dayjs from "dayjs";
import { Followers } from "../api/followers";
const fmtDate = (date: string) => {
  const result = dayjs(date).format("YYYY-MM-DD");
  return result;
};

const igUrl = (username: string) => {
  return `https://www.instagram.com/${username}`;
};
export const FollowersTable = ({ followers }: { followers: Followers[] }) => {
  return (
    <Card className="rounded-none">
      <CardContent className="px-0">
        <Table className="h-full">
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="w-4">No</TableHead>
              <TableHead className="pl-5">アカウント</TableHead>
              <TableHead className="w-36">Start</TableHead>
              <TableHead className="w-36">フォロー中</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {followers.map((user, i) => (
              <TableRow className="text-xs text-neutral-700">
                <TableCell className="w-4">{i + 1}</TableCell>
                <TableCell>
                  <a
                    href={igUrl(user.username)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "link", size: "sm" })}
                  >
                    {user.username}
                  </a>
                </TableCell>
                <TableCell className="w-36">
                  {fmtDate(user.created_at)}
                </TableCell>
                <TableCell className="w-36">
                  {fmtDate(user.updated_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
