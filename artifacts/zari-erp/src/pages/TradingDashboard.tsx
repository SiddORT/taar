import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, useLogout, getGetMeQueryKey, } from "@workspace/api-client-react";
import { ShoppingCart, Package, TrendingUp, IndianRupee } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";

export default function TradingDashboard() {
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

  const cards = [
    {
      title: "Products",
      value: "0",
      description: "Trading products",
      icon: Package,
    },
    {
      title: "Purchases",
      value: "₹0",
      description: "Purchase value",
      icon: ShoppingCart,
    },
    {
      title: "Sales",
      value: "₹0",
      description: "Sales value",
      icon: IndianRupee,
    },
    {
      title: "Profit",
      value: "₹0",
      description: "Current profit",
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
            Trading Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your trading activities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>

                  <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-cyan-800" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-400">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cyan-900">
            Recent Trading Activity
          </h2>

          <div className="mt-6 text-center py-12 text-gray-400">
            No trading activity available yet.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}