import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMe,
  useLogout,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { TrendingUp, IndianRupee, ShoppingCart } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";

export default function TradingProfit() {
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

  const stats = [
    {
      title: "Purchase Value",
      value: "₹0",
      icon: ShoppingCart,
    },
    {
      title: "Sales Value",
      value: "₹0",
      icon: IndianRupee,
    },
    {
      title: "Gross Profit",
      value: "₹0",
      icon: TrendingUp,
    },
  ];

  return (
    <AppLayout
      username={user.username}
      role={user.role}
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
    >
      <div className="max-w-screen-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-900">
            Trading Profit
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Analyze trading profitability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>

                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-cyan-900">
            Profit Analysis
          </h2>

          <div className="py-16 text-center text-gray-400">
            Profit data will appear here once trading transactions are
            available.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
