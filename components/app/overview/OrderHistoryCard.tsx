"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import Link from "next/link";
import { supabaseClient } from "@/utils/supabaseClient";
import { Database } from "@/utils/types/supabaseTypes";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/context/useSession";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "stock",
    header: () => <div className="">Stock</div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <Avatar className="h-7 w-7">
            <AvatarImage
              // @ts-ignore
              src={row.original.stocks.image_url}
              alt={row.original.stock}
            />
            <AvatarFallback>{row.getValue("symbol")}</AvatarFallback>
          </Avatar>
          <h1 className="ml-2 font-medium uppercase">{row.original.stock}</h1>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div className="">Type</div>,
    cell: ({ row }) => {
      const type = row.original.type;

      return <div className="font-medium uppercase">{type}</div>;
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="">Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price")) / 10 ** 6;

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "date",
    header: () => <div className="">Date</div>,
    cell: ({ row }) => {
      const date = format(
        new Date(row.original.created_at),
        "yyyy-MM-dd HH:mm:ss"
      );
      return <div className="text-left">{date}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="">Status</div>,
    cell: ({ row }) => {
      return <div className="text-left">{row.original.status}</div>;
    },
  },
  {
    id: "interact",
    enableHiding: false,
    cell: ({ row }) => {
      const symbol = row.original.stock;

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Details</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    defaultValue="100%"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxWidth">Max. width</Label>
                  <Input
                    id="maxWidth"
                    defaultValue="300px"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    defaultValue="25px"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxHeight">Max. height</Label>
                  <Input
                    id="maxHeight"
                    defaultValue="none"
                    className="col-span-2 h-8"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
];

interface OrderHistoryProps {
  stocks: string | null;
}

export function OrderHistory({ stocks }: OrderHistoryProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [data, setData] = React.useState<Order[]>([]);

  const session = useSession();

  console.log(session.profile?.wallet_address);

  React.useEffect(() => {
    const fetchStocks = async () => {
      if (!session.profile?.wallet_address) return;
      const userId = session.profile?.wallet_address;
      console.log("USER ID", userId);
      let orderQuery = supabaseClient
        .from("orders")
        .select("*, stocks(*)")
        .eq("user", userId);

      if (stocks !== null) {
        orderQuery = orderQuery.eq("stock", stocks);
      }

      const { data: orders, error: fetchOrdersError } = await orderQuery;

      console.log("ORDERS", orders);

      if (fetchOrdersError) {
        console.log(fetchOrdersError);
      }

      if (orders) {
        console.log(orders);
        setData(orders);
      }
    };
    fetchStocks();
  }, [session.profile?.wallet_address]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
  });

  return (
    <div className="mt-2 pb-2">
      <Card>
        <CardHeader>
          <CardTitle className="">Order History</CardTitle>
        </CardHeader>

        <div className="rounded-md">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
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
                    );
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
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No recent orders. Start trading{" "}
                    <Link href={"/app/trade"}>
                      <p className="text-indigo-600">here.</p>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
