import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  TrendingUp,
  CreditCard,
  Apple,
  ChevronRight,
  Bell,
  AlertCircle,
  IndianRupee,
  Receipt,
  Package,
  Dumbbell,
  Calendar,
} from "lucide-react";
import { fetchMe } from "@/api/auth";
import { listPayments } from "@/api/payments";
import { getMyDietPlan } from "@/api/diet-plans";
import { listNotifications } from "@/api/notifications";
import gsap from "gsap";
import { Button } from "../ui/button";
import { formatDate, formatDateTime } from "@/utils/date";
import { isDateInRange, formatRangeLabel } from "@/utils/dateRange";
import {
  DateRangeFilter,
  type DateRangeFilterValue,
} from "@/components/ui/date-range-filter";
import { Skeleton } from "../ui/skeleton";
import type { User } from "@/types";
import type { Payment } from "@/types";
import type { DietPlan } from "@/types";
import type { Notification } from "@/types";

type MemberUser = User & {
  membershipId?: string;
  membershipType?: string;
  membershipExpiry?: Date | string;
  joinDate?: Date | string;
  membershipPlan?: string;
};

function paymentTypeLabel(type: Payment["type"]): string {
  switch (type) {
    case "membership":
      return "Membership";
    case "personal_training":
      return "Personal Training";
    case "product":
      return "Product";
    default:
      return "Payment";
  }
}

function paymentTypeIcon(type: Payment["type"]) {
  switch (type) {
    case "membership":
      return CreditCard;
    case "personal_training":
      return Dumbbell;
    case "product":
      return Package;
    default:
      return Receipt;
  }
}

export function MemberDashboard() {
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement>(null);
  const [member, setMember] = useState<MemberUser | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityDateFilter, setActivityDateFilter] = useState<DateRangeFilterValue>({
    preset: "all",
    dateFrom: null,
    dateTo: null,
  });

  useEffect(() => {
    let cancelled = false;
    setError(null);
    Promise.all([
      fetchMe().then((u) => u as MemberUser),
      listPayments({ page: 1, limit: 100 }).then((res) => res.data),
      getMyDietPlan().catch(() => null),
      listNotifications({ page: 1, limit: 5 }).then((res) => res.data),
    ])
      .then(([user, paymentList, plan, notifs]) => {
        if (cancelled) return;
        setMember(user);
        setPayments(Array.isArray(paymentList) ? paymentList : []);
        setDietPlan(plan);
        setNotifications(Array.isArray(notifs) ? notifs : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cardsRef.current || loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dashboard-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      );
    }, cardsRef);
    return () => ctx.revert();
  }, [loading]);

  const joinDate = member?.joinDate
    ? new Date(member.joinDate)
    : null;
  const expiryDate = member?.membershipExpiry
    ? new Date(member.membershipExpiry)
    : null;
  const now = Date.now();
  const daysUntilExpiry =
    joinDate && expiryDate
      ? Math.ceil((expiryDate.getTime() - now) / (1000 * 60 * 60 * 24))
      : 0;
  const membershipProgressPercent = useMemo(() => {
    if (!joinDate || !expiryDate) return 0;
    const total = expiryDate.getTime() - joinDate.getTime();
    const elapsed = now - joinDate.getTime();
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }, [joinDate, expiryDate]);

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const paymentsThisMonth = useMemo(
    () =>
      payments.filter((p) => {
        if (p.status !== "paid" || !p.date) return false;
        const d = new Date(p.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length,
    [payments, thisMonth, thisYear],
  );
  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === "pending" || p.status === "overdue"),
    [payments],
  );
  const pendingAmount = useMemo(
    () => pendingPayments.reduce((sum, p) => sum + p.amount, 0),
    [pendingPayments],
  );
  const totalPaid = useMemo(
    () =>
      payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );
  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        })
        .slice(0, 8),
    [payments],
  );

  const activityDateFrom = activityDateFilter.dateFrom;
  const activityDateTo = activityDateFilter.dateTo;
  const hasActivityDateFilter = Boolean(activityDateFrom && activityDateTo);
  const filteredActivityPayments = useMemo(() => {
    if (!hasActivityDateFilter) return recentPayments;
    return payments
      .filter((p) => {
        const d = p.date || p.createdAt || null;
        return d && isDateInRange(d, activityDateFrom!, activityDateTo!);
      })
      .sort((a, b) => {
        const da = (a.date ? new Date(a.date).getTime() : 0) || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const db = (b.date ? new Date(b.date).getTime() : 0) || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return db - da;
      })
      .slice(0, 8);
  }, [payments, recentPayments, hasActivityDateFilter, activityDateFrom, activityDateTo]);
  const filteredActivityTotalPaid = useMemo(
    () =>
      filteredActivityPayments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0),
    [filteredActivityPayments],
  );
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications],
  );
  const hasPersonalTraining = Boolean(member?.hasPersonalTraining);
  const planName = member?.membershipType ?? "—";

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Notifications strip */}
      {!loading && unreadNotifications.length > 0 && (
        <div
          className="flex items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-pointer hover:bg-amber-500/15 transition-colors"
          onClick={() => navigate("/member/notifications")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/member/notifications")}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground">
                {unreadNotifications.length} unread notification
                {unreadNotifications.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {unreadNotifications[0]?.title}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">
                  {member?.name?.split(" ")[0] ?? "Member"}
                </span>
                !
              </h1>
              <p className="text-muted-foreground">
                Here's your fitness journey at a glance
              </p>
            </>
          )}
        </div>
        {!loading && member?.joinDate && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ko-500/10 border border-ko-500/20">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-ko-500 to-ko-600 animate-pulse" />
            <span className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent text-sm font-medium">
              Member since {new Date(member.joinDate).getFullYear()}
            </span>
          </div>
        )}
      </div>

      {/* Quick Stats - 4 cards */}
      <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-card/50 border border-border space-y-3"
            >
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))
        ) : (
          [
            {
              label: "Days Left",
              value: expiryDate && daysUntilExpiry > 0 ? daysUntilExpiry : "—",
              sub: expiryDate && daysUntilExpiry <= 0 ? "Expired" : undefined,
              icon: Clock,
              color:
                daysUntilExpiry > 0 && daysUntilExpiry < 30
                  ? "bg-red-500/20 text-red-500"
                  : "bg-ko-500/20 text-ko-500",
            },
            {
              label: "Payments This Month",
              value: paymentsThisMonth,
              sub: totalPaid > 0 ? `₹${totalPaid.toLocaleString("en-IN")} total paid` : undefined,
              icon: TrendingUp,
              color: "bg-emerald-500/20 text-emerald-500",
            },
            {
              label: "Plan",
              value: planName,
              icon: CreditCard,
              color: "bg-orange-500/20 text-orange-500",
            },
            {
              label: "Pending Dues",
              value:
                pendingAmount > 0
                  ? `₹${pendingAmount.toLocaleString("en-IN")}`
                  : "None",
              sub: pendingPayments.length > 0 ? `${pendingPayments.length} pending` : undefined,
              icon: IndianRupee,
              color:
                pendingAmount > 0
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-muted text-muted-foreground",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="dashboard-card p-5 rounded-xl bg-card/50 border border-border hover:border-border/80 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              {stat.sub && (
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Membership Status */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">
              Membership Status
            </h3>
            {!loading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/member/membership")}
                className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent hover:from-ko-600 hover:to-ko-700"
              >
                View Details
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
              <Skeleton className="sm:w-48 h-32 rounded-lg" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-ko-500/20 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-ko-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-lg">
                      {planName} {planName !== "—" ? "Plan" : ""}
                    </p>
                    <p className="text-muted-foreground">
                      ID: {member?.membershipId ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        Membership Progress
                      </span>
                      <span className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent font-medium">
                        {Math.round(membershipProgressPercent)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-ko-500 to-ko-600 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, membershipProgressPercent))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm flex-wrap gap-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Started: {formatDate(member?.joinDate)}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Expires: {formatDate(member?.membershipExpiry)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:w-48 p-4 rounded-lg bg-ko-500/10 border border-ko-500/20">
                <p className="text-muted-foreground text-sm mb-1">
                  Days Remaining
                </p>
                <p className="font-display text-4xl font-bold bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">
                  {expiryDate && daysUntilExpiry > 0 ? daysUntilExpiry : "0"}
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Renew to keep your benefits
                </p>
                <Button
                  size="sm"
                  className="w-full mt-3 bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
                  onClick={() => navigate("/member/membership")}
                >
                  Renew Now
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Second card: Diet or Upcoming / Summary */}
        {hasPersonalTraining && (
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : dietPlan ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Today's Nutrition
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/member/diet")}
                    className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent hover:from-ko-600 hover:to-ko-700"
                  >
                    View Plan
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-muted-foreground text-xs mb-1">Protein</p>
                    <p className="font-display text-xl font-bold bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">
                      {dietPlan.macros.protein}g
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-muted-foreground text-xs mb-1">Carbs</p>
                    <p className="font-display text-xl font-bold text-blue-500">
                      {dietPlan.macros.carbs}g
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-muted-foreground text-xs mb-1">Fats</p>
                    <p className="font-display text-xl font-bold text-orange-500">
                      {dietPlan.macros.fats}g
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Apple className="w-5 h-5 text-ko-500" />
                    <span className="text-foreground">Daily Calories</span>
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">
                    {dietPlan.dailyCalories}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Apple className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No diet plan yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your trainer can assign a plan for you.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/member/diet")}
                >
                  View Diet
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Row: Recent Activity (Payments) + Notifications */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity - real payments with date filter */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-display text-xl font-bold text-foreground">
              Recent Activity
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {!loading && (
                <DateRangeFilter
                  value={activityDateFilter}
                  onChange={setActivityDateFilter}
                  showAllTime={true}
                  compact={true}
                />
              )}
              {!loading && payments.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/member/payments")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  View all
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
          {hasActivityDateFilter && activityDateFrom && activityDateTo && (
            <div className="mb-4 text-sm text-muted-foreground flex flex-wrap items-center gap-2">
              <span>Showing {formatRangeLabel(activityDateFrom, activityDateTo)}</span>
              {filteredActivityTotalPaid > 0 && (
                <span className="text-foreground font-medium">
                  · Total paid in period: ₹{filteredActivityTotalPaid.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          )}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : filteredActivityPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Receipt className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">
                  {hasActivityDateFilter ? "No payments in this period" : "No payments yet"}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1"
                  onClick={() => navigate("/member/payments")}
                >
                  Go to Payments
                </Button>
              </div>
            ) : (
              filteredActivityPayments.map((payment) => {
                const Icon = paymentTypeIcon(payment.type);
                const isPaid = payment.status === "paid";
                return (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPaid ? "bg-emerald-500/20" : "bg-amber-500/20"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isPaid ? "text-emerald-500" : "text-amber-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">
                        {paymentTypeLabel(payment.type)}
                        {payment.planName ? ` · ${payment.planName}` : ""}
                        {payment.productName ? ` · ${payment.productName}` : ""}
                      </p>
                      <p className="text-muted-foreground text-sm flex items-center gap-2 flex-wrap">
                        <span>
                          {payment.date
                            ? formatDate(payment.date)
                            : payment.dueDate
                              ? `Due ${formatDate(payment.dueDate)}`
                              : "—"}
                        </span>
                        <span className="font-medium text-foreground">
                          ₹{payment.amount.toLocaleString("en-IN")}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            isPaid
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : payment.status === "overdue"
                                ? "bg-red-500/20 text-red-600 dark:text-red-400"
                                : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Notifications panel - always show in second column on lg */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">
              Notifications
            </h3>
            {!loading && notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/member/notifications")}
              >
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No notifications
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                    n.isRead ? "bg-muted/30 border-transparent" : "bg-ko-500/5 border-ko-500/20"
                  }`}
                  onClick={() => navigate("/member/notifications")}
                >
                  <p className="font-medium text-foreground text-sm truncate">
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
