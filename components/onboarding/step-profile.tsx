"use client";

import { useFormContext } from "react-hook-form";
import { OnboardingFormData } from "../onboarding-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StepProfile() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Step 1: Your Profile</h2>
        <p className="text-muted-foreground">
          Let&apos;s start with your name and username
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            This is how other users will see you in the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              type="text"
              placeholder="e.g. John Doe"
              {...register("full_name")}
              className={errors.full_name ? "border-destructive" : ""}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="e.g. johndoe123"
              {...register("username")}
              className={errors.username ? "border-destructive" : ""}
            />
            <p className="text-sm text-muted-foreground">
              Only letters, numbers, and underscores allowed.
            </p>
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
