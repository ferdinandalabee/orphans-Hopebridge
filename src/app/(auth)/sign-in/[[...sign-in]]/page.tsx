import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex min-h-screen w-full items-center justify-center p-4'>
      <SignIn />
    </div>
  )
}