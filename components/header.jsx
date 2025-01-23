import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { LayoutDashboard, PenBox } from 'lucide-react'

const Header = () => {
	return (
		<div className='fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b'>
			<nav className='container mx-auto flex justify-between items-center py-4 px-4'>
				<Link href="/">
					<Image src="/logo.png" alt="logo" width={200} height={60} className='h-8 w-auto object-contain' />
				</Link>
				<div className='flex items-center space-x-4'>
					<SignedIn>
						<Link href={'/dashboard'} className='text-gray-600 flex items-center gap-2'>
							<Button variant="outline">
								<LayoutDashboard size={18} />
								<span className='hidden md:inline'>Dashboard</span>
							</Button>
						</Link>

						<Link href={'/transaction/create'} className='flex items-center gap-2 text-white'>
							<Button >
								<PenBox size={18} />
								<span className='hidden md:inline'>Add Transaction</span>
							</Button>
						</Link>

					</SignedIn>
					<SignedOut>
						<SignInButton forceRedirectUrl='/dashboard'>
							<Button variant="outline" className="text-gray-600 border-[#E6EFF4] hover:bg-[#E6EFF4]" href='/auth/sign-in'>login</Button>
						</SignInButton>
					</SignedOut>
					<SignedIn >
						<UserButton appearance={
							{
								elements: {
									avatarBox: "w-10 h-10",
								}
							}

						} />
					</SignedIn>
				</div>

			</nav>
		</div>

	)
}

export default Header
