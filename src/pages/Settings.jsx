import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/FormInput';
import { useToast } from '@hooks/useToast';
import { useAuth } from '@hooks/useAuth';
import authService from '@services/authService';

export const Settings = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Account settings
  const [accountData, setAccountData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [accountErrors, setAccountErrors] = useState({});
  const [watchlistError, setWatchlistError] = useState('');
  const [notificationsError, setNotificationsError] = useState('');

  const tokenPattern = /^[A-Z0-9]{2,10}$/;

  const validatePasswordFields = (data) => {
    const errors = {};
    if (!data.currentPassword) errors.currentPassword = 'Current password is required';
    if (!data.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      if (data.newPassword.length < 8) errors.newPassword = 'Minimum 8 characters required';
      if (!/[A-Z]/.test(data.newPassword)) errors.newPassword = 'Must include at least one uppercase letter';
      if (!/[a-z]/.test(data.newPassword)) errors.newPassword = 'Must include at least one lowercase letter';
      if (!/\d/.test(data.newPassword)) errors.newPassword = 'Must include at least one number';
      if (data.newPassword === data.currentPassword) errors.newPassword = 'New password must be different';
    }
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const updateAccountField = (key, value) => {
    setAccountData((prev) => {
      const next = { ...prev, [key]: value };
      setAccountErrors(validatePasswordFields(next));
      return next;
    });
  };

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_enabled: true,
    telegram_enabled: false,
    dashboard_enabled: true,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    alert_frequency: 'realtime',
  });

  // Alert preferences
  const [alertPreferences, setAlertPreferences] = useState({
    priorities: ['HIGH', 'MEDIUM', 'LOW'],
    watchlist: [],
    newWatchlistToken: '',
  });


  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setAccountData((prev) => ({ ...prev, email: user?.email || '' }));
  }, [user?.email]);

  useEffect(() => {
    if (
      notificationSettings.quiet_hours_enabled &&
      notificationSettings.quiet_hours_start === notificationSettings.quiet_hours_end
    ) {
      setNotificationsError('Quiet hours start and end time cannot be the same');
    } else {
      setNotificationsError('');
    }
  }, [
    notificationSettings.quiet_hours_enabled,
    notificationSettings.quiet_hours_start,
    notificationSettings.quiet_hours_end,
  ]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const profile = await authService.getProfile();
      if (profile?.preferences) {
        const prefs = profile.preferences;
        setNotificationSettings((prev) => ({
          ...prev,
          email_enabled: prefs.notifications_enabled ?? prev.email_enabled,
          alert_frequency: prefs.email_frequency ?? prev.alert_frequency,
        }));
      }
    } catch (err) {
      // Profile unavailable — use defaults silently
      console.warn('Settings: could not load preferences, using defaults.', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (notificationsError) {
      toast.error(notificationsError);
      return;
    }

    try {
      setSavingNotifications(true);
      await authService.updateProfile({
        preferences: {
          notifications_enabled: notificationSettings.email_enabled,
          email_frequency: notificationSettings.alert_frequency,
        },
      });
      toast.success('Notification settings saved successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to save notification settings');
      console.error(err);
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSavingPreferences(true);
      await authService.updateProfile({
        preferences: {
          notifications_enabled: notificationSettings.email_enabled,
          email_frequency: notificationSettings.alert_frequency,
        },
      });
      toast.success('Alert preferences saved successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to save alert preferences');
      console.error(err);
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleChangePassword = async () => {
    if (!accountData.newPassword || accountData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (accountData.newPassword !== accountData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      await authService.requestPasswordReset(user?.email);
      setAccountData((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setAccountErrors({});
      toast.success('Password reset email sent. Follow the link in your email to update your password.');
    } catch (err) {
      toast.error(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Type DELETE to confirm account deletion');
      return;
    }

    try {
      setDeletingAccount(true);
      // Account deletion is not available via self-service API.
      // Log the user out as a best-effort action.
      toast.success('Your session has been ended. Contact support to permanently delete your account.');
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Failed to logout. Please try again.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleAddToWatchlist = () => {
    const token = alertPreferences.newWatchlistToken.trim().toUpperCase();

    if (!token) {
      setWatchlistError('Token symbol is required');
      return;
    }
    if (!tokenPattern.test(token)) {
      setWatchlistError('Token must be 2-10 uppercase letters/numbers');
      return;
    }
    if (alertPreferences.watchlist.includes(token)) {
      setWatchlistError('Token already exists in watchlist');
      return;
    }

    setWatchlistError('');
    setAlertPreferences((prev) => ({
      ...prev,
      watchlist: [...prev.watchlist, token],
      newWatchlistToken: '',
    }));
  };

  const handleRemoveFromWatchlist = (token) => {
    setAlertPreferences((prev) => ({
      ...prev,
      watchlist: prev.watchlist.filter((t) => t !== token),
    }));
  };

  const togglePriority = (priority) => {
    setAlertPreferences((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white-primary">Settings</h1>
          <p className="text-white-muted mt-1">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#1a1a1a] rounded-xl p-1 mb-8 w-fit">
          {[
            { id: 'account', label: 'Account' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'preferences', label: 'Preferences' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-black-oled shadow'
                  : 'text-white-muted hover:text-white-primary hover:bg-[#2c2c2c]/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account Settings Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Email */}
            <div className="bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white-primary">Email Address</h2>
              <Input label="Email" type="email" value={accountData.email} disabled />
              <p className="text-sm text-white-muted">Your email address cannot be changed at this time.</p>
            </div>

            {/* Change Password */}
            <div className="bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white-primary">Change Password</h2>
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter your current password"
                value={accountData.currentPassword}
                onChange={(e) => updateAccountField('currentPassword', e.target.value)}
                error={accountErrors.currentPassword}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={accountData.newPassword}
                onChange={(e) => updateAccountField('newPassword', e.target.value)}
                error={accountErrors.newPassword}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                value={accountData.confirmPassword}
                onChange={(e) => updateAccountField('confirmPassword', e.target.value)}
                error={accountErrors.confirmPassword}
              />
              <Button
                variant="success"
                className="mt-2"
                onClick={handleChangePassword}
                isLoading={savingPassword}
                disabled={savingPassword}
              >
                Update Password
              </Button>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#0a0a0a]/70 backdrop-blur-sm border border-danger-600/30 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-semibold text-danger-400">Danger Zone</h2>
              <p className="text-sm text-white-muted">This action cannot be undone. Please be certain.</p>
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete Account</Button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Channels */}
            <div className="bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#1a1a1a] rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white-primary">Notification Channels</h2>
              {[
                { key: 'dashboard_enabled', label: 'Dashboard Notifications' },
                { key: 'email_enabled',     label: 'Email Notifications' },
                { key: 'telegram_enabled',  label: 'Telegram Notifications' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-white-secondary group-hover:text-white-primary transition-colors">{label}</span>
                  <button
                    type="button"
                    onClick={() => setNotificationSettings((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                      notificationSettings[key] ? 'bg-emerald-500' : 'bg-[#2c2c2c]'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      notificationSettings[key] ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </label>
              ))}
            </div>

            {/* Quiet Hours */}
            <div className="bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white-primary">Quiet Hours</h2>
                <button
                  type="button"
                  onClick={() => setNotificationSettings((prev) => ({ ...prev, quiet_hours_enabled: !prev.quiet_hours_enabled }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    notificationSettings.quiet_hours_enabled ? 'bg-emerald-500' : 'bg-[#2c2c2c]'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    notificationSettings.quiet_hours_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              {notificationSettings.quiet_hours_enabled && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Start Time"
                    type="time"
                    value={notificationSettings.quiet_hours_start}
                    onChange={(e) => setNotificationSettings((prev) => ({ ...prev, quiet_hours_start: e.target.value }))}
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={notificationSettings.quiet_hours_end}
                    onChange={(e) => setNotificationSettings((prev) => ({ ...prev, quiet_hours_end: e.target.value }))}
                  />
                </div>
              )}
              {notificationsError && (
                <p className="text-sm text-danger-400">{notificationsError}</p>
              )}
            </div>

            {/* Alert Frequency */}
            <div className="bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white-primary">Alert Frequency</h2>
              <div className="flex gap-3">
                {['realtime', 'hourly', 'daily'].map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setNotificationSettings((prev) => ({ ...prev, alert_frequency: freq }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 capitalize ${
                      notificationSettings.alert_frequency === freq
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-transparent border-[#1a1a1a] text-white-muted hover:border-white/20 hover:text-white-primary'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="success"
              onClick={handleSaveNotifications}
              isLoading={savingNotifications}
              disabled={savingNotifications}
            >
              Save Notification Settings
            </Button>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Priority Filter */}
            <div className="bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white-primary">Alert Priorities</h2>
                <p className="text-sm text-white-muted mt-1">Choose which priority levels you want to receive</p>
              </div>
              <div className="flex gap-3">
                {[
                  { label: 'HIGH',   color: 'border-danger-500/40 text-danger-400 bg-danger-500/10',   active: 'border-danger-500/60 bg-danger-500/20' },
                  { label: 'MEDIUM', color: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',  active: 'border-yellow-500/60 bg-yellow-500/20' },
                  { label: 'LOW',    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', active: 'border-emerald-500/60 bg-emerald-500/20' },
                ].map(({ label, color, active }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => togglePriority(label)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                      alertPreferences.priorities.includes(label) ? `${color} ${active}` : 'border-[#1a1a1a] text-white-muted hover:border-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Watchlist */}
            <div className="bg-[#0a0a0a]/70 backdrop-blur-sm border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white-primary">Watchlist</h2>
                <p className="text-sm text-white-muted mt-1">Tokens you want to receive alerts for</p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add token (e.g. BTC, ETH)"
                  value={alertPreferences.newWatchlistToken}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setAlertPreferences((prev) => ({ ...prev, newWatchlistToken: value }));
                    if (!value.trim()) {
                      setWatchlistError('');
                    } else if (!tokenPattern.test(value.trim())) {
                      setWatchlistError('Token must be 2-10 uppercase letters/numbers');
                    } else if (alertPreferences.watchlist.includes(value.trim())) {
                      setWatchlistError('Token already exists in watchlist');
                    } else {
                      setWatchlistError('');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddToWatchlist();
                    }
                  }}
                  error={watchlistError}
                />
                <Button variant="success" onClick={handleAddToWatchlist} className="whitespace-nowrap">Add</Button>
              </div>
              {alertPreferences.watchlist.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {alertPreferences.watchlist.map((token) => (
                    <span
                      key={token}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a]/80 border border-[#2c2c2c] rounded-full text-sm font-medium text-white-secondary"
                    >
                      {token}
                      <button
                        onClick={() => handleRemoveFromWatchlist(token)}
                        className="text-white-muted hover:text-danger-400 transition-colors text-xs leading-none"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="success"
              onClick={handleSavePreferences}
              isLoading={savingPreferences}
              disabled={savingPreferences}
            >
              Save Preferences
            </Button>
          </div>
        )}

      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-danger-600/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-danger-400">Delete Account</h3>
            <p className="text-sm text-white-muted">
              This will permanently remove your account and preferences. Type DELETE to continue.
            </p>
            <Input
              label="Confirmation"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                disabled={deletingAccount}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                isLoading={deletingAccount}
                disabled={deletingAccount || deleteConfirmText !== 'DELETE'}
              >
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
