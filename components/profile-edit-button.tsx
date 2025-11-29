"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function ProfileEditButton({ label = "Edit" }: { label?: string }) {
  function openEditor() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("profile-open-edit"));
    }
  }

  return (
    // use a more visible button variant so users notice it
    <Button onClick={openEditor} className="ml-2" aria-label="Edit nutrition profile">
      {label}
    </Button>
  );
}
