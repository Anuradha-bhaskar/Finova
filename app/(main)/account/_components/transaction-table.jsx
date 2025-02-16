"use client";
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { categoryColors } from "@/data/categories";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

import React, { use, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, MoreHorizontal, RefreshCw, Search, Trash, X } from "lucide-react";

import { DropdownMenuContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { bulkDeleteTransactions } from "@/actions/accounts";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIDs, setSelectedIDs] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: "date", direction: "desc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);


  // Handle bulk delete of transactions
  const handleBulkDelete = async() => {
    if(!window.confirm("Are you sure you want to delete the selected transactions?")){
      return;
    }
    await deleteFn(selectedIDs);
    // Update UI by filtering out deleted transactions
    setSelectedIDs([]);
    
  };

  // Memoized function to filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter((transaction) => transaction.description?.toLowerCase().includes(searchTermLower));
    }

    // Apply recurring filter
    if(recurringFilter){
      result = result.filter((transaction) => recurringFilter === "recurring" ? transaction.isRecurring : !transaction.isRecurring);
    }

    // Apply type filter
    if(typeFilter){
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        default:
          comparison = 0;
          break;
      }

      return sortConfig.direction === "asc" ? comparison : comparison * -1;
    });

    return result;
  }, [transactions, sortConfig, searchTerm, typeFilter, recurringFilter]);


  // Handle sorting logic
  const handleSort = (field) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
    }))
  };

  // Handle selection of individual transaction
  const handleSelect = (id) => {
    setSelectedIDs(current => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  // Handle selection of all transactions
  const handleSelectAll = (id) => {
    setSelectedIDs((current) => current.length === filteredAndSortedTransactions.length ? [] : filteredAndSortedTransactions.map((transaction) => transaction.id));
  };

  // Show toast message when transactions are deleted
  useEffect(() => {
    if(deleted && !deleteLoading){
      toast.error("Transactions deleted successfully");
      }
  }, [deleted, deleteLoading]);
  
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIDs([]);
  };

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransactions, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIDs([]); // Clear selections on page change
  };

  return (
    
    <div className="space-y-4">
      {deleteLoading && <BarLoader color="#9333ea" width="100%" className="mt-4"/>}
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8"
            placeholder="Search Transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange= {(value) => {
             setTypeFilter(value);
             setCurrentPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select  value={recurringFilter} onValueChange={(value) => {
              setRecurringFilter(value);
              setCurrentPage(1);
            }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="recurring">Recurring only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring only</SelectItem>
            </SelectContent>
          </Select>

          {/* Bulk Actions */}
          {selectedIDs.length > 0 && <div>
            <Button variant="destructive" className="text-white" size="sm" onClick={handleBulkDelete} >
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected ({selectedIDs.length})
            </Button>
          </div>
          }
          {(searchTerm||typeFilter||recurringFilter) && (
            <Button className="p-3" variant="outline" size="icon"  onClick={handleClearFilters} title="Clear Filters">
              <X className="h-4 w-5 text-slate-600"/>
            </Button>
          ) }
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox className="text-white" onCheckedChange={handleSelectAll} checked={
                    selectedIDs.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  } />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")} >
                <div className="flex items-center">Date{" "}
                  {sortConfig.field === 'date' && (
                    sortConfig.direction === "asc" ? (<ChevronUp className="h-4 w-4 ml-1" />) :
                      (<ChevronDown className="h-4 w-4 ml-1" />)
                  )}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")} >
                <div className="flex items-center">Description</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("category")} >
                <div className="flex items-center">Category
                  {sortConfig.field === 'category' && (
                    sortConfig.direction === "asc" ? (<ChevronUp className="h-4 w-4 ml-1" />) :
                      (<ChevronDown className="h-4 w-4 ml-1" />)
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("amount")} >
                <div className="flex items-center justify-end">Amount
                  {sortConfig.field === 'amount' && (
                    sortConfig.direction === "asc" ? (<ChevronUp className="h-4 w-4 ml-1" />) :
                      (<ChevronDown className="h-4 w-4 ml-1" />)
                  )}
                </div>
              </TableHead>
              <TableHead>
                Recurring
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell >
                    <Checkbox className="text-white" onCheckedChange={() => handleSelect(transaction.id)} checked={selectedIDs.includes(transaction.id)} />
                  </TableCell>
                  <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="capitalize">
                    <span style={{ background: categoryColors[transaction.category] }} className="px-2 py-1 rounded-md text-white text-sm">
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium" style={{ color: transaction.type === "INCOME" ? "#10b981" : "#ef4444" }}>
                    {transaction.type === "INCOME" ? "+ " : "- "}
                    &#8377;{transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.recurring ?
                    (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                              <RefreshCw className="h-3 w-3" />
                              {RECURRING_INTERVALS[transaction.recurring]}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">
                                Next Date:
                              </div>
                              <div>
                                {format(new Date(transaction.nextRecurringDate), "PP")}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                    : <Badge variant="outline" className="gap-1 text-slate-600">
                      <Clock className="h-3 w-3" />
                      One-time
                    </Badge>}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white">
                        <DropdownMenuItem
                          onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}
                        >Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive"
                        onClick={()=>deleteFn([transaction.id])}
                        >Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default TransactionTable
