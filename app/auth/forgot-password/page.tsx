import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-svh w-full flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href="/" className="text-lg">🍽️ What2Eat</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
