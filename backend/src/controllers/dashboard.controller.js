const User = require('../models/User');
const Payment = require('../models/Payment');

/**
 * Admin dashboard overview.
 * GET /dashboard/overview
 * Query: dateFrom, dateTo (optional, ISO date strings). When set, revenue chart, recent payments,
 * recent members and period stats are filtered by this range.
 * Returns: stats, revenueChartData, recentMembers, recentPayments, expiringMembers, dateRange?.
 */
async function getOverview(req, res, next) {
  try {
    const now = new Date();
    const dateFromParam = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
    const dateToParam = req.query.dateTo ? new Date(req.query.dateTo) : null;
    const hasDateFilter = dateFromParam && dateToParam && !Number.isNaN(dateFromParam.getTime()) && !Number.isNaN(dateToParam.getTime());
    const filterFrom = hasDateFilter ? dateFromParam : null;
    const filterTo = hasDateFilter ? dateToParam : null;

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const expiringEnd = new Date(now);
    expiringEnd.setDate(expiringEnd.getDate() + 14);
    const expiringStart = new Date(now);

    // Counts in parallel
    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      totalTrainers,
      pendingPaymentsCount,
      expiringCount,
      paidPayments,
      paidThisMonth,
    ] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ role: 'member', status: 'active' }),
      User.countDocuments({
        role: 'member',
        createdAt: { $gte: startOfThisMonth },
      }),
      User.countDocuments({ role: 'trainer' }),
      Payment.countDocuments({ status: { $in: ['pending', 'overdue'] } }),
      User.countDocuments({
        role: 'member',
        membershipExpiry: { $gte: expiringStart, $lte: expiringEnd },
        status: 'active',
      }),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'paid', date: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = paidPayments[0]?.total ?? 0;
    const monthlyRevenue = paidThisMonth[0]?.total ?? 0;

    let revenueChartData;
    let recentMembersFormatted;
    let recentPaymentsFormatted;
    let periodRevenue = null;
    let periodNewMembers = null;

    if (hasDateFilter) {
      const dayDiff = Math.ceil((filterTo - filterFrom) / (1000 * 60 * 60 * 24));
      const groupByDay = dayDiff <= 31;

      const revenueMatch = { status: 'paid', date: { $gte: filterFrom, $lte: filterTo } };
      const revenueAgg = await Payment.aggregate([
        { $match: revenueMatch },
        {
          $group: {
            _id: groupByDay
              ? { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
              : { year: { $year: '$date' }, month: { $month: '$date' } },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const periodRevenueAgg = await Payment.aggregate([
        { $match: revenueMatch },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      periodRevenue = periodRevenueAgg[0]?.total ?? 0;
      periodNewMembers = await User.countDocuments({
        role: 'member',
        createdAt: { $gte: filterFrom, $lte: filterTo },
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (groupByDay) {
        revenueChartData = revenueAgg.map((r) => ({
          month: r._id,
          monthKey: r._id,
          revenue: r.revenue,
        }));
        if (revenueChartData.length === 0) {
          revenueChartData = [{ month: 'No data', monthKey: '-', revenue: 0 }];
        }
      } else {
        const map = new Map(revenueAgg.map((r) => [r._id.year + '-' + String(r._id.month).padStart(2, '0'), r.revenue]));
        const monthsInRange = [];
        const cur = new Date(filterFrom);
        while (cur <= filterTo) {
          const key = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0');
          monthsInRange.push({
            month: monthNames[cur.getMonth()] + ' ' + cur.getFullYear(),
            monthKey: key,
            revenue: map.get(key) ?? 0,
          });
          cur.setMonth(cur.getMonth() + 1);
        }
        revenueChartData = monthsInRange.length ? monthsInRange : [{ month: 'No data', monthKey: '-', revenue: 0 }];
      }

      const recentMembers = await User.find({
        role: 'member',
        createdAt: { $gte: filterFrom, $lte: filterTo },
      })
        .select('name avatar status membershipType hasPersonalTraining membershipExpiry joinDate createdAt')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
      recentMembersFormatted = recentMembers.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        avatar: u.avatar,
        status: u.status,
        membershipType: u.membershipType || '—',
        hasPersonalTraining: u.hasPersonalTraining || false,
        membershipExpiry: u.membershipExpiry ? u.membershipExpiry.toISOString() : null,
        joinDate: u.joinDate ? u.joinDate.toISOString() : null,
        createdAt: u.createdAt ? u.createdAt.toISOString() : null,
      }));

      const recentPayments = await Payment.find({
        createdAt: { $gte: filterFrom, $lte: filterTo },
      })
        .populate('membershipPlanId', 'name')
        .populate('product', 'name')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
      recentPaymentsFormatted = recentPayments.map((p) => ({
        id: p._id.toString(),
        memberId: p.member?.toString() || p.member,
        memberName: p.memberName,
        amount: p.amount,
        type: p.type,
        status: p.status,
        date: p.date ? p.date.toISOString() : null,
        dueDate: p.dueDate ? p.dueDate.toISOString() : null,
        invoiceNumber: p.invoiceNumber,
        createdAt: p.createdAt ? p.createdAt.toISOString() : null,
        planName: p.membershipPlanId?.name || null,
        productName: p.product?.name || null,
      }));
    } else {
      // Default: last 12 months
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const revenueByMonth = await Payment.aggregate([
        { $match: { status: 'paid', date: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      revenueChartData = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = { year: d.getFullYear(), month: d.getMonth() + 1 };
        const found = revenueByMonth.find(
          (r) => r._id.year === key.year && r._id.month === key.month
        );
        revenueChartData.push({
          month: monthNames[d.getMonth()],
          monthKey: `${key.year}-${String(key.month).padStart(2, '0')}`,
          revenue: found ? found.revenue : 0,
        });
      }

      const recentMembers = await User.find({ role: 'member' })
        .select('name avatar status membershipType hasPersonalTraining membershipExpiry joinDate createdAt')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
      recentMembersFormatted = recentMembers.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        avatar: u.avatar,
        status: u.status,
        membershipType: u.membershipType || '—',
        hasPersonalTraining: u.hasPersonalTraining || false,
        membershipExpiry: u.membershipExpiry ? u.membershipExpiry.toISOString() : null,
        joinDate: u.joinDate ? u.joinDate.toISOString() : null,
        createdAt: u.createdAt ? u.createdAt.toISOString() : null,
      }));

      const recentPayments = await Payment.find()
        .populate('membershipPlanId', 'name')
        .populate('product', 'name')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
      recentPaymentsFormatted = recentPayments.map((p) => ({
        id: p._id.toString(),
        memberId: p.member?.toString() || p.member,
        memberName: p.memberName,
        amount: p.amount,
        type: p.type,
        status: p.status,
        date: p.date ? p.date.toISOString() : null,
        dueDate: p.dueDate ? p.dueDate.toISOString() : null,
        invoiceNumber: p.invoiceNumber,
        createdAt: p.createdAt ? p.createdAt.toISOString() : null,
        planName: p.membershipPlanId?.name || null,
        productName: p.product?.name || null,
      }));
    }

    // Members expiring in next 14 days (for alert list)
    const expiringMembers = await User.find({
      role: 'member',
      membershipExpiry: { $gte: expiringStart, $lte: expiringEnd },
      status: 'active',
    })
      .select('name membershipId membershipType membershipExpiry')
      .sort({ membershipExpiry: 1 })
      .limit(10)
      .lean();

    const expiringMembersFormatted = expiringMembers.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      membershipId: u.membershipId,
      membershipType: u.membershipType || '—',
      membershipExpiry: u.membershipExpiry ? u.membershipExpiry.toISOString() : null,
    }));

    // Previous month revenue for trend (optional)
    const paidLastMonth = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          date: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const lastMonthRevenue = paidLastMonth[0]?.total ?? 0;
    const revenueTrend =
      lastMonthRevenue > 0
        ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : (monthlyRevenue > 0 ? 100 : 0);

    const newMembersLastMonth = await User.countDocuments({
      role: 'member',
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });
    const membersTrend =
      newMembersLastMonth > 0
        ? Math.round(((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100)
        : (newMembersThisMonth > 0 ? 100 : 0);

    const statsPayload = {
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      totalTrainers,
      totalRevenue,
      monthlyRevenue,
      pendingPayments: pendingPaymentsCount,
      expiringMemberships: expiringCount,
      revenueTrend,
      membersTrend,
    };
    if (periodRevenue != null) statsPayload.periodRevenue = periodRevenue;
    if (periodNewMembers != null) statsPayload.periodNewMembers = periodNewMembers;

    const response = {
      stats: statsPayload,
      revenueChartData,
      recentMembers: recentMembersFormatted,
      recentPayments: recentPaymentsFormatted,
      expiringMembers: expiringMembersFormatted,
    };
    if (hasDateFilter) {
      response.dateRange = {
        dateFrom: filterFrom.toISOString(),
        dateTo: filterTo.toISOString(),
      };
    }
    res.json(response);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverview,
};
