import React, { Suspense } from 'react'
import DashboardPage from './page'
import { BarLoader } from 'react-spinners'

const DashboardLayout = () => {
  return (
    <div className='px-5'>
        <h1 className='text-5xl font-bold gradient-title mb-5' >DashBoard</h1>
        <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color='#4e93d4'/>}>
            <DashboardPage />
        </Suspense>
    
    </div>
  )
}

export default DashboardLayout
