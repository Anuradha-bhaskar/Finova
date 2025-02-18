"use client";
import { scanReceipt } from '@/actions/transaction';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { Camera, Loader2 } from 'lucide-react';
import React, { use, useEffect, useRef } from 'react'
import { toast } from 'sonner';

const ReceiptScanner = ({onScanComplete}) => {
  const fileInputRef = useRef();
  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  }= useFetch(scanReceipt);

  const handleReceiptScan = async(file) => {
    if(file.size > 5 * 1024 * 1024){
      toast.error('File size should be less than 5MB');
      return;
    }
    await scanReceiptFn(file);
  };

  useEffect(() => {
    if(scannedData && !scanReceiptLoading){
      onScanComplete(scannedData);
      toast.success('Receipt scanned successfully');
    }
  }, [scannedData, scanReceiptLoading]);

  return (
    <div>
      <input type="file" ref={fileInputRef} className='hidden' accept='image/*' capture='environment' 
        onChange={(e)=> {
            const file = e.target.files?.[0];
            if(file){
                handleReceiptScan(file);
            }
        }}
      />
      <Button type="button" onClick={()=>fileInputRef.current?.click()} disabled={scanReceiptLoading}
      className='text-white w-full hover:opacity-90 animate-gradient bg-gradient-to-br from-purple-400 via-blue-400 to-purple-400 transition-opacity' >{scanReceiptLoading?
        <>
            <Loader2 className='mr-2 animate-spin' />
            <span>Scanning Receipt...</span>
       </>:
      <>
        <Camera className='mr-2' />
        <span >Scan Receipt with AI</span>
      </>}</Button>

    </div>
  )
}

export default ReceiptScanner
