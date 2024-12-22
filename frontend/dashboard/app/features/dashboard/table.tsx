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
import { ColumnDef, ColumnFilter, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";

type RowData = Followers & {
  isFollowed: boolean;
}

const fmtDate = (date: string) => {
  const result = dayjs(date).format("YYYY-MM-DD");
  return result;
};

const igUrl = (username: string) => {
  return `https://www.instagram.com/${username}`;
};


const columns = (): ColumnDef<RowData>[] => [
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
      return row.isFollowed ? 'フォロワー' : `解除(${fmtDate(row.updated_at)})`
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
    },
    filterFn: (row, _columnId, _filterValue) => {
      return !row.original.isFollowed
    }
  },
]

export const FollowersTable = ({ followers, filter }: { followers: Followers[], filter?: { onlyUnfollowers?: boolean } }) => {
  const latestUpdatedAt = useMemo(() => {
    const cloned = [...followers]
    if (!cloned.length) return dayjs()
    cloned.sort((a, b) => dayjs(b.updated_at).diff(dayjs(a.updated_at)))
    return dayjs(cloned[0].updated_at)
  }, [followers])

  const [sorting, setSorting] = useState<SortingState>([])
  const [filterConditions, setFilterConditions] = useState<ColumnFilter[]>(filter?.onlyUnfollowers ? [
    {
      id: 'updated_at',
      value: latestUpdatedAt.toString()
    }
  ] : [])

  const data = useMemo(() => {
    return followers.map((f) => {
      return {
        ...f,
        isFollowed: latestUpdatedAt.isSame(dayjs(f.updated_at), 'day'),
      }
    })
  }, [followers])

  const table = useReactTable({
    data,
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setFilterConditions,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters: filterConditions
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
