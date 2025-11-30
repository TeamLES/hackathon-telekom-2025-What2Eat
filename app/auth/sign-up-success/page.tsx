import { AuthLayout } from "@/components/auth-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Thank you for signing up!
        </h1>
        <p className="text-muted-foreground mt-2">
          Please check your email to confirm your account before signing in.
        </p>
        <div className="mt-6 text-5xl">📧</div>
      </div>
    </AuthLayout>
  );
}
