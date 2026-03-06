import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { RefreshCw, Users, Activity, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAdminDashboard, useAdminUsers, useToggleUserStatus } from '@hooks/useAdmin';
import { useToast } from '@hooks/useToast';
import metricsService from '@services/metricsService';

const CARD_BASE = 'bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#1a1a1a] rounded-2xl p-4';

const StatCard = ({ label, value, hint, icon: Icon }) => (
  <div className={CARD_BASE}>
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <Icon className="w-4 h-4 text-slate-500" />
    </div>
    <p className="text-2xl font-semibold text-slate-100">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{hint}</p>
  </div>
);

const ChartSkeleton = () => <div className={`${CARD_BASE} h-[280px] animate-pulse`} />;

export const Admin = () => {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 400);
    return () => clearTimeout(timer);
  }, [rawQuery]);
  const [pendingToggle, setPendingToggle] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (pendingToggle) setPendingToggle(null);
      if (selectedUser) setSelectedUser(null);
    };

    if (pendingToggle || selectedUser) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }

    return undefined;
  }, [pendingToggle, selectedUser]);

  const userParams = useMemo(() => ({ page, limit: 8, query: debouncedQuery, role }), [page, debouncedQuery, role]);

  const { data, isLoading, refetch, isFetching } = useAdminDashboard();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers(userParams);
  const toggleStatus = useToggleUserStatus(userParams);

  const summary = data?.summary;

  const handleConfirmToggle = async () => {
    if (!pendingToggle) return;
    try {
      await toggleStatus.mutateAsync({
        userId: pendingToggle.userId,
        active: pendingToggle.nextActive,
      });
      toast.success(`User ${pendingToggle.nextActive ? 'enabled' : 'disabled'} successfully`);
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setPendingToggle(null);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {summary?.lastUpdated
                ? `Last updated ${new Date(summary.lastUpdated).toLocaleTimeString()}`
                : 'Live metrics overview'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border bg-[#0d0d0d] border-[#1f1f1f] text-slate-400 hover:text-white hover:border-[#2a2a2a]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard label="Total Events" value={summary?.totalEventsIngested ?? '—'} hint="ingested" icon={Activity} />
          <StatCard label="Total Alerts" value={summary?.totalAlertsGenerated ?? '—'} hint="generated" icon={AlertTriangle} />
          <StatCard label="Active Users" value={summary?.activeUsers ?? '—'} hint="currently enabled" icon={Users} />
          <StatCard label="System Uptime" value={summary ? `${summary.systemUptime}%` : '—'} hint="rolling" icon={ShieldCheck} />
          <StatCard label="Error Rate" value={summary ? `${summary.errorRate}%` : '—'} hint="last window" icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Suspense fallback={<ChartSkeleton />}>
            <div className={`${CARD_BASE} xl:col-span-2 h-[300px]`}>
              <p className="text-sm font-medium text-slate-300 mb-3">Events Over Time</p>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data?.eventsOverTime || []}>
                  <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f0f0f', border: '1px solid #222', color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="value" stroke="#94a3b8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <div className={`${CARD_BASE} h-[300px]`}>
              <p className="text-sm font-medium text-slate-300 mb-3">Alerts by Priority</p>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={data?.alertsByPriority || []} dataKey="value" nameKey="priority" innerRadius={55} outerRadius={85}>
                    {(data?.alertsByPriority || []).map((entry) => (
                      <Cell
                        key={entry.priority}
                        fill={entry.priority === 'HIGH' ? '#94a3b8' : entry.priority === 'MEDIUM' ? '#64748b' : '#334155'}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f0f0f', border: '1px solid #222', color: '#e2e8f0' }} />
                  <Legend
                    formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <div className={`${CARD_BASE} xl:col-span-3 h-[300px]`}>
              <p className="text-sm font-medium text-slate-300 mb-3">User Growth</p>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data?.userGrowth || []}>
                  <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f0f0f', border: '1px solid #222', color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="value" stroke="#cbd5e1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Suspense>
        </div>

        <div className={CARD_BASE}>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <p className="text-sm font-medium text-slate-300">User Management</p>
            <div className="flex items-center gap-2">
              <input
                value={rawQuery}
                onChange={(event) => {
                  setPage(1);
                  setRawQuery(event.target.value);
                }}
                placeholder="Search users"
                className="px-3 py-1.5 rounded-lg text-xs bg-[#0d0d0d] border border-[#1f1f1f] text-slate-200"
              />
              <select
                value={role}
                onChange={(event) => {
                  setPage(1);
                  setRole(event.target.value);
                }}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#0d0d0d] border border-[#1f1f1f] text-slate-200"
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-[#1f1f1f]">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#151515] animate-pulse">
                      <td className="py-3 pr-2"><div className="h-3 bg-[#1f1f1f] rounded w-24" /></td>
                      <td className="py-3 pr-2"><div className="h-3 bg-[#1f1f1f] rounded w-36" /></td>
                      <td className="py-3 pr-2"><div className="h-3 bg-[#1f1f1f] rounded w-10" /></td>
                      <td className="py-3 pr-2"><div className="h-5 bg-[#1f1f1f] rounded w-14" /></td>
                      <td className="py-3 text-right"><div className="h-6 bg-[#1f1f1f] rounded w-28 ml-auto" /></td>
                    </tr>
                  ))
                ) : (
                  (usersData?.items || []).map((user) => (
                    <tr key={user.id} className="border-b border-[#151515] text-slate-300">
                      <td className="py-2">{user.name || '—'}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2 uppercase text-xs">{user.role || 'user'}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${user.active === false ? 'bg-slate-700/40 text-slate-400' : 'bg-emerald-900/40 text-emerald-300'}`}>
                          {user.active === false ? 'disabled' : 'active'}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            className="text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:border-[#3a3a3a]"
                            aria-label={`View details for ${user.name || user.email}`}
                            onClick={async () => {
                              const details = await metricsService.getUserDetails(user.id);
                              setSelectedUser(details);
                            }}
                          >
                            View
                          </button>
                          <button
                            className="text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:border-[#3a3a3a]"
                            aria-label={`${user.active === false ? 'Enable' : 'Disable'} ${user.name || user.email}`}
                            onClick={() =>
                              setPendingToggle({
                                userId: user.id,
                                nextActive: user.active === false,
                                name: user.name || user.email,
                              })
                            }
                          >
                            {user.active === false ? 'Enable' : 'Disable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-500">
              Page {usersData?.page || 1} of {usersData?.totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button
                className="text-xs px-2 py-1 rounded border border-[#2a2a2a] disabled:opacity-40"
                disabled={(usersData?.page || 1) <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <button
                className="text-xs px-2 py-1 rounded border border-[#2a2a2a] disabled:opacity-40"
                disabled={(usersData?.page || 1) >= (usersData?.totalPages || 1)}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {pendingToggle && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4" role="presentation" onClick={() => setPendingToggle(null)}>
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl p-6 space-y-4" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" onClick={(event) => event.stopPropagation()}>
            <h3 id="admin-confirm-title" className="text-lg font-semibold text-slate-100">Confirm action</h3>
            <p className="text-sm text-slate-400">
              {pendingToggle.nextActive ? 'Enable' : 'Disable'} user <span className="text-slate-200">{pendingToggle.name}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1.5 text-sm rounded-lg border border-[#2a2a2a]" onClick={() => setPendingToggle(null)}>
                Cancel
              </button>
              <button autoFocus className="px-3 py-1.5 text-sm rounded-lg border border-[#3a3a3a] bg-[#111]" onClick={handleConfirmToggle}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4" role="presentation" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl p-6 space-y-4" role="dialog" aria-modal="true" aria-labelledby="admin-user-details-title" onClick={(event) => event.stopPropagation()}>
            <h3 id="admin-user-details-title" className="text-lg font-semibold text-slate-100">User Details</h3>
            <div className="text-sm text-slate-300 space-y-1">
              <p><span className="text-slate-500">Name:</span> {selectedUser.name || '—'}</p>
              <p><span className="text-slate-500">Email:</span> {selectedUser.email}</p>
              <p><span className="text-slate-500">Role:</span> {selectedUser.role || 'user'}</p>
              <p><span className="text-slate-500">Status:</span> {selectedUser.active === false ? 'disabled' : 'active'}</p>
              <p><span className="text-slate-500">Created:</span> {new Date(selectedUser.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex justify-end">
              <button autoFocus className="px-3 py-1.5 text-sm rounded-lg border border-[#2a2a2a]" onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && <div className="fixed top-0 left-0 right-0 h-0.5 bg-slate-500/50 animate-pulse" />}
    </div>
  );
};

export default Admin;
