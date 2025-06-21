import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <SignUp 
          path="/sign-up" 
          routing="path" 
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard/orphanage/register"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
