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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { supabaseClient } from "@/utils/supabaseClient";
import { Database } from "@/utils/types/supabaseTypes";
import {
  PythHttpClient,
  getPythProgramKeyForCluster,
} from "@pythnetwork/client";
import { Connection, clusterApiUrl } from "@solana/web3.js";

type Stock = Database["public"]["Tables"]["stocks"]["Row"];

export const columns: ColumnDef<Stock>[] = [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => (
      <Avatar className="h-9 w-9">
        <AvatarImage src={row.original.image_url!} alt={row.getValue("name")} />
        <AvatarFallback>{row.getValue("symbol")}</AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "id",
    header: () => <div className="">Symbol</div>,
    cell: ({ row }) => {
      const symbol = row.original.symbol;

      return <div className="font-medium uppercase">{symbol}</div>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          className="hidden md:inline-flex text-left "
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Asset
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="hidden md:block text-left ml-2">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: () => <div className="">Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const symbol = row.original.symbol;

      return (
        <Link href={`/app/trade/${symbol}`}>
          <Button className="bg-indigo-600 hover:bg-indigo-800">Trade</Button>
        </Link>
      );
    },
  },
];

export function TradeAssetsCard() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [data, setData] = React.useState<Stock[]>([]);

  React.useEffect(() => {
    const fetchStocks = async () => {
      const { data: stocks, error } = await supabaseClient
        .from("stocks")
        .select("*")
        .order("name", { ascending: true });

      if (stocks) {
        // Fetch prices from Pyth
        const pythConnection = new PythHttpClient(
          new Connection(clusterApiUrl("devnet")),
          getPythProgramKeyForCluster("devnet")
        );
        const pythData = await pythConnection.getData();
        const pricesMap: { [key: string]: number } = {};

        for (let stock of stocks) {
          // Fetch price using Pyth's productPrice.get
          const priceInfo = pythData.productPrice.get(stock.price_feed_id);
          if (priceInfo) {
            pricesMap[stock.symbol] = priceInfo.aggregate.price;
          } else {
            console.error("Price info not found for:", stock.symbol);
          }
        }

        // Add prices to stocks data
        const stocksWithData = stocks.map((stock) => {
          return {
            ...stock,
            price: pricesMap[stock.symbol] || null,
          };
        });

        setData(stocksWithData);
      }
    };
    fetchStocks();
  }, []);

  console.log(data);

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
    <div className="">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by asset..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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
                  key={row.original.id}
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
                  No results.
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
    </div>
  );
}
