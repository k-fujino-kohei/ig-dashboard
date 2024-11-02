import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import dayjs from "dayjs";
import { Followers } from "../api/followers";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

const fmtDate = (date: string) => {
  const result = dayjs(date).format("YYYY-MM-DD");
  return result;
};

const igUrl = (username: string) => {
  return `https://www.instagram.com/${username}`;
};

export const isFollowed = (follower: Followers, latestUpdatedAt: dayjs.Dayjs) => {
  return latestUpdatedAt.isSame(dayjs(follower.updated_at), 'day')
}

export const latestUpdatedAt = (followers: Followers[]) => {
  const cloned = [...followers]
  if (!cloned.length) return dayjs()
  cloned.sort((a, b) => dayjs(b.updated_at).diff(dayjs(a.updated_at)))
  return dayjs(cloned[0].updated_at)
}

const columns = (latestUpdatedAt: dayjs.Dayjs): ColumnDef<Followers>[] => [
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          asChild
          className="text-xs w-[130px]"
        >
          <TableHead>
            アカウント
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </TableHead>
        </Button>
      )
    },
    cell: ({ row }) => {
      const username: string = row.getValue('username')
      return (
        <div className="w-[130px]">
          <a
            href={igUrl(username)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "link", size: "sm" })}
          >
            {username}
          </a>
        </div>
      )
    }
  },
  {
    accessorKey: "created_at",
    accessorFn: (row) => {
      return fmtDate(row.created_at);
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 text-xs w-[90px]"
        >
          開始日
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <TableCell className="w-[120px]">
          {row.getValue('created_at')}
        </TableCell>
      )
    }
  },
  {
    accessorKey: 'updated_at',
    accessorFn: (row) => {
      return isFollowed(row, latestUpdatedAt) ? 'フォロワー' : `解除(${fmtDate(row.updated_at)})`
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 text-xs w-[120px]"
        >
          ステータス
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <TableCell className="text-xs w-[120px]">
          {row.getValue('updated_at')}
        </TableCell>
      )
    }
  },
]

export const FollowersTable = ({ followers }: { followers: Followers[] }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data: followers,
    columns: columns(latestUpdatedAt(followers)),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <Card className="rounded-none">
      <CardContent className="px-0">
        <Table className="h-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="text-xs">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="text-xs"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="w-36 text-start">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
