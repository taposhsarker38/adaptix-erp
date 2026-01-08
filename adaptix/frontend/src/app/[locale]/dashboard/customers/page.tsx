import { CustomerClient } from "@/components/customers/customer-client";
import { Users, TrendingUp, Award, UserCheck } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* CRM-Focused Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Customer Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Build relationships, track engagement, manage loyalty
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <UserCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Active CRM
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg">
            <Award className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Loyalty Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <CustomerClient />
    </div>
  );
}
