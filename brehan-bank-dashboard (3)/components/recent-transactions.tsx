import { ArrowDownIcon, ArrowUpIcon, MoreHorizontal, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const transactions = [
  {
    id: "TR-7295",
    customer: "John Smith",
    amount: "$1,250.00",
    status: "completed",
    date: "2023-05-28",
    type: "deposit",
  },
  {
    id: "TR-7294",
    customer: "Alice Johnson",
    amount: "$530.00",
    status: "processing",
    date: "2023-05-28",
    type: "withdrawal",
  },
  {
    id: "TR-7293",
    customer: "Robert Brown",
    amount: "$2,100.00",
    status: "completed",
    date: "2023-05-27",
    type: "deposit",
  },
  {
    id: "TR-7292",
    customer: "Emily Davis",
    amount: "$1,050.00",
    status: "failed",
    date: "2023-05-27",
    type: "transfer",
  },
  {
    id: "TR-7291",
    customer: "Michael Wilson",
    amount: "$780.00",
    status: "completed",
    date: "2023-05-26",
    type: "withdrawal",
  },
]

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Recent financial transactions across all accounts.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search transactions..." className="w-[200px] pl-8 md:w-[300px]" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>{transaction.customer}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.type === "deposit" ? (
                      <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                    ) : transaction.type === "withdrawal" ? (
                      <ArrowDownIcon className="h-4 w-4 text-rose-500" />
                    ) : (
                      <ArrowUpIcon className="h-4 w-4 rotate-45 text-amber-500" />
                    )}
                    {transaction.amount}
                  </div>
                </TableCell>
                <TableCell className="capitalize">{transaction.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.status === "completed"
                        ? "default"
                        : transaction.status === "processing"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>View customer</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Export data</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
