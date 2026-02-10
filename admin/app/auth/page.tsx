"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.replace("/fire-personnel/login");
  }, [router]);

  return null;
};

export default AuthPage;

