"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

const CreateAccountDrawer = ({ children }) => {

   // State to manage the drawer's open/close status
   const [isOpen, setIsOpen] = useState(false);

   // Initialize the form with react-hook-form and zod for validation
   const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
      reset,
    } = useForm({
      resolver: zodResolver(accountSchema),
      defaultValues: {
        name: "",
        type: "CURRENT",
        balance: "",
        isDefault: false,
      },
    });

   // Fetch function to create a new account
   const {
      loading: createAccountLoading,
      fn: createAccountFn,
      error,
      data: newAccount,
   } = useFetch(createAccount);

   // Function to submit the form
   const onSubmit = async (data) => {
      await createAccountFn(data);
   };

   useEffect(() => {
      if (newAccount && !createAccountLoading) {
         toast.success("Account created successfully");
         reset();
         setIsOpen(false);
      }
   }, [createAccountLoading, newAccount]);

   useEffect(() => {
      if (error) {
         toast.error(error.message || "Failed to create account");
      }
   }, [error]);

   return (
      <Drawer isOpen={isOpen} onisOpenChange={setIsOpen}>
         <DrawerTrigger asChild>{children}</DrawerTrigger>
         <DrawerContent>
            <DrawerHeader>
               <DrawerTitle>Create New Account</DrawerTitle>
            </DrawerHeader>
            <div className='px-4 pb-4'>
               {/* Form to create a new account */}
               <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
                  {/* Account name input */}
                  <div className='space-y-2'>
                     <label htmlFor="name">Account Name</label>
                     <Input id="name" placeholder="e.g., Main Checking" {...register("name")} />

                     {/* Display error message if name is not provided */}
                     {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
                  </div>
                  <div className='space-y-2'>
                     <label htmlFor="type">Account Type</label>
                     <Select onValueChange={(value) => setValue("type", value)} defaultValue={watch("type")} >
                        <SelectTrigger id="type">
                           <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                           <SelectItem value="CURRENT">Current</SelectItem>
                           <SelectItem value="SAVINGS">Savings</SelectItem>
                        </SelectContent>
                     </Select>

                     {/* Display error message if type is not provided */}
                     {errors.type && <p className='text-sm text-red-500'>{errors.type.message}</p>}
                  </div>

                  {/* Balance input */}
                  <div className="space-y-2">
                     <label
                        htmlFor="balance"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                     >
                        Initial Balance
                     </label>
                     <Input
                        id="balance"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("balance")}
                     />
                     {/* Display error message if balance is not provided */}
                     {errors.balance && (
                        <p className="text-sm text-red-500">{errors.balance.message}</p>
                     )}
                  </div>

                  {/* Set as default switch */}
                  <div className="flex items-center justify-between rounded-lg border p-3">
                     <div className="space-y-0.5">
                        <label
                           htmlFor="isDefault"
                           className="text-base font-medium cursor-pointer"
                        >
                           Set as Default
                        </label>
                        <p className="text-sm text-muted-foreground">
                           This account will be selected by default for transactions
                        </p>
                     </div>
                     <Switch
                        id="isDefault"
                        checked={watch("isDefault")}
                        onCheckedChange={(checked) => setValue("isDefault", checked)}
                     />
                  </div>

                  <div className="flex gap-4 pt-4">
                     <DrawerClose asChild>
                        <Button type="button" variant="outline" className="flex-1">
                           Cancel
                        </Button>
                     </DrawerClose>
                     <Button 
                        type="submit"
                        className="flex-1 text-white"
                        disabled={createAccountLoading}
                     >
                        {createAccountLoading ? (
                           <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                           </>
                        ) : (
                           "Create Account"
                        )}
                     </Button>
                  </div>
               </form>
            </div>
         </DrawerContent>
      </Drawer>

   )
}

export default CreateAccountDrawer
