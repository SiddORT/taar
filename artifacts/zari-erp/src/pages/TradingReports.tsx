import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMe,
  useLogout,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { FileText } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";

export default function TradingReports() {
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

  const reports = [
    "Sales Report",
    "Purchase Report",
    "Profit Report",
    "Product Performance",
    "Customer Sales Report",
    "Vendor Purchase Report",
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
            Trading Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate and view trading reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <button
              key={report}
              type="button"
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-cyan-300 hover:shadow-md transition-all text-left"
            >
              <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-cyan-800" />
              </div>

              <h2 className="mt-4 font-semibold text-gray-900">
                {report}
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Generate {report.toLowerCase()}.
              </p>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}