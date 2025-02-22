"use client";
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';

import useFetch from '@/hooks/use-fetch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import CreateAccountDrawer from '@/components/create-acccount-drawer';

import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar"
import { Switch } from '@/components/ui/switch';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import ReceiptScanner from './recipt-scanner';


const AddTransactionForm = ({ accounts, categories, editMode= false, initialData=null }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');


    const [date, setDate] = useState( editMode && initialData ? new Date(initialData.date) : new Date());
    const { register, setValue, handleSubmit, formState: { errors }, watch, getValues, reset } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: 
        editMode && initialData ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            category: initialData.category,
            description: initialData.description,
            accountId: initialData.accountId,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && { recurringInterval: initialData.recurringInterval }),
        } : {
            type: 'EXPENSE',
            amount: '',
            description: '',
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
        }
    });

    const {
        loading: transactionLoading,
        fn: transactionFn,
        data: transactionResult,
    } = useFetch(editMode? updateTransaction : createTransaction);

    const onSubmit = async (data) => {
        const formData = {
            ...data,
            amount: parseFloat(data.amount),
            date: date,
        };
        if (editMode) {
            transactionFn(editId, formData);
        }
        else{
            transactionFn(formData);
        }
    };

    useEffect(() => {
        if (transactionResult?.success && !transactionLoading) {
            toast.success(editMode? "Transaction updated successfully" :"Transaction created successfully");
            reset();
            router.push(`/account/${transactionResult.data.accountId}`);
        }
    }, [transactionResult, transactionLoading, editMode]);

    const type = watch('type');
    const isRecurring = watch('isRecurring');
    const selectedCategory = watch('category');
    const filteredCategories = categories.filter((category) => category.type === type);

    const handleScanComplete = (scannedData) => {
        console.log(scannedData);
        if (scannedData) {
            setValue('amount', scannedData.amount.toString());
            // Parse and set the date properly
            const parsedDate = new Date(scannedData.date);
            setDate(parsedDate); // This updates the calendar UI
            setValue('date', parsedDate); // This updates the form state
            if (scannedData.description) {
                setValue('description', scannedData.description)
            };
            if (scannedData.category) {
                setValue('category', scannedData.category);
            }
            toast.success('Receipt scanned successfully');
        }
    };

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setValue('date', newDate);
    }

    return (
        <form className='space-y-6' onSubmit={handleSubmit(onSubmit)} >
            {/* AI recipt Scanner */}
            {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

            {/* Type */}
            <div className='space-y-2'>
                <label className='text-sm font-medium' >Type</label>
                <Select
                    onValueChange={(value) => setValue('type', value)}
                    defaultValue={type}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && <p className='text-red-500 text-sm'>{errors.type.message}</p>}
            </div>

            {/* Amount and Account */}
            <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                    <label className='text-sm font-medium' >Amount</label>
                    <Input type="number" {...register('amount')} step="0.01" placeholder="0.0" />
                    {errors.amount && <p className='text-red-500 text-sm'>{errors.amount.message}</p>}
                </div>

                <div className='space-y-2'>
                    <label className='text-sm font-medium' >Account</label>
                    <Select
                        onValueChange={(value) => setValue('accountId', value)}
                        defaultValue={getValues('accountId')}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name} (&#8377;{parseFloat(account.balance).toFixed(2)})
                                </SelectItem>
                            ))}
                            <CreateAccountDrawer>
                                <Button variant="ghost" className="w-full select-none items-center text-sm outline-none" >Create Account</Button>
                            </CreateAccountDrawer>
                        </SelectContent>

                    </Select>
                    {errors.accountId && <p className='text-red-500 text-sm'>{errors.accountId.message}</p>}
                </div>
            </div>

            {/* Category */}
            <div className='space-y-2'>
                <label className='text-sm font-medium' >Category</label>
                <Select
                    onValueChange={(value) => setValue('category', value)}
                    value={selectedCategory}
                    defaultValue={getValues('category')}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>

                </Select>
                {errors.category && <p className='text-red-500 text-sm'>{errors.category.message}</p>}
            </div>

            {/* Date */}
            <div className='space-y-2'>
                <label className='text-sm font-medium' >Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full pl-3 text-left font-normal">
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" >
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            className="bg-white"
                        />
                    </PopoverContent>
                </Popover>

                {errors.date && <p className='text-red-500 text-sm'>{errors.date.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Enter description" {...register("description")} />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            {/* Recurring Transaction */}
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <label
                        htmlFor="isDefault"
                        className="text-base font-medium cursor-pointer"
                    >
                        Recurring Transaction
                    </label>
                    <p className="text-sm text-muted-foreground">
                        Set up a recurring schedule for this transaction
                    </p>
                </div>
                <Switch
                    checked={isRecurring}
                    onCheckedChange={(checked) => setValue("isRecurring", checked)}
                />
            </div>
            {isRecurring && <div className='space-y-2'>
                <label className='text-sm font-medium' >Recurring Interval</label>
                <Select
                    onValueChange={(value) => setValue('recurringInterval', value)}
                    defaultValue={getValues('recurringInterval')}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Interval" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>

                </Select>
                {errors.recurringInterval && <p className='text-red-500 text-sm'>{errors.recurringInterval.message}</p>}
            </div>}

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button type="submit" className="w-full text-white" disabled={transactionLoading}>
                    {
                        transactionLoading ? 
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            {editMode ? "Updating..." : "Creating..."}
                        </> 
                        : editMode ? "Update Transaction" : "Create Transaction"
                    }
                </Button>
            </div>

        </form>
    )
}

export default AddTransactionForm
