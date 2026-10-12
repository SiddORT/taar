import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMe,
  useLogout,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Plus, Search } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";

export default function TradingPurchase() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const token = localStorage.getItem("zarierp_token");

  const { data: user, isLoading: loadingUser } = useGetMe({
    query: { enabled: !!token } as any,
  });

  useEffect(() => {
    if (!token || (!loadingUser && !user)) {
      setLocation("/login");
    }
  }, [token, user, loadingUser, setLocation]);

  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      localStorage.removeItem("zarierp_token");
      queryClient.invalidateQueries({
        queryKey: getGetMeQueryKey(),
      });
      setLocation("/login");
    }
  };

  if (!user) return null;

  return (
    <AppLayout
      username={user.username}
      role={user.role}
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
    >
      <div className="max-w-screen-xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-900">
              Trading Purchase
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage trading purchase transactions.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-900 text-white text-sm font-medium hover:bg-cyan-800">
            <Plus className="h-4 w-4" />
            New Purchase
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search purchases..."
              className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>Purchase No.</span>
            <span>Vendor</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
          </div>

          <div className="py-16 text-center text-gray-400">
            No purchase records found.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
