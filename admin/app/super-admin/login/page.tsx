"use client";

import AuthForm from "@/components/auth/AuthForm";
import { Toaster } from "react-hot-toast";
import { Shield } from "lucide-react";

const SuperAdminLoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 dark:from-gray-950 dark:via-red-900/20 dark:to-orange-900/20 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Login</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            System administrator access
          </p>
        </div>

        <AuthForm 
          authType="superadmin" 
          usernameLabel="Username"
          usernamePlaceholder="Enter your username"
        />
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default SuperAdminLoginPage;

