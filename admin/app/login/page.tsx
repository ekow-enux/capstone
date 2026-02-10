"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to fire personnel login (default)
    router.replace("/fire-personnel/login");
  }, [router]);

  return null;
};

export default LoginPage;
