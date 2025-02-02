import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const AccountCard = ({account}) => {
    const {name, balance, type, isDefault , id} = account;
    return (
        <div>
            <Card className='hover:shadow-md transition-shadow group relative'>
                <Link href={`/account/${id}`}>
                <CardHeader className='flex flex-row justify-between items-center space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium capitalize'>{name}</CardTitle>
                    <Switch checked={isDefault}/>
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold text-gray-700'>
                    &#8377;{parseFloat(balance).toFixed(2)}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                        {type.charAt(0) + type.slice(1).toLowerCase()} Account
                    </p>
                </CardContent>
                <CardFooter className='flex justify-between text-sm text-muted-foreground'>
                    <div className='flex items-center'>
                        <ArrowUpRight className='mr-1 h-4 w-4 text-green-500'/>
                        Income
                    </div>
                    <div className='flex items-center'>
                        <ArrowDownRight className='mr-1 h-4 w-4 text-red-500'/>
                        Expense
                    </div>
                </CardFooter>
                </Link>
            </Card>

        </div>
    )
}

export default AccountCard
