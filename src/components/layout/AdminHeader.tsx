"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function AdminHeader({
  onMenuClick,
}: {
  /** Opens the mobile sidebar drawer. */
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push(ROUTES.LOGIN);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-10">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Hamburger (mobile) + Page Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden -ml-1 p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            Admin Panel
          </h2>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* User Info — hidden on small screens to save space */}
          <div className="hidden sm:flex items-center gap-2 text-sm max-w-[40vw]">
            <User className="h-4 w-4 text-gray-500 shrink-0" />
            <span className="text-gray-700 font-medium truncate">
              {user?.firstName || user?.email}
            </span>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
