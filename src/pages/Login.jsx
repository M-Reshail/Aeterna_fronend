import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert } from '@components/common/UI';
import { useAuth } from '@hooks/useAuth';
import { validateEmail } from '@utils/helpers';
import { Zap, Lock, Gauge, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    if (name === 'email') {
      if (!value.trim()) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email address';
      return '';
    }

    if (name === 'password') {
      if (!value) return 'Password is required';
      return '';
    }

    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || err.message || '';

      // Map common HTTP status codes to human-readable messages
      let errorMsg;
      if (status === 401 || status === 403) {
        errorMsg = 'Incorrect email or password. Please try again.';
      } else if (status === 404) {
        errorMsg = 'No account found with that email address.';
      } else if (status === 429) {
        errorMsg = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (status === 503 || err.code === 'ERR_NETWORK' || !navigator.onLine) {
        errorMsg = 'Unable to reach the server. Check your internet connection and try again.';
      } else if (serverMsg) {
        errorMsg = serverMsg;
      } else {
        errorMsg = 'Sign-in failed. Please try again or contact support.';
      }

      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-oled flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(2, 7, 13, 0.95) 0%, rgba(4, 32, 40, 0.9) 100%)',
      }}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl w-full mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block">
            <RouterLink to="/" className="inline-flex items-center space-x-2 mb-12">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white-primary font-bold text-lg">Æ</span>
              </div>
              <span className="text-2xl font-bold text-white-primary">AETERNA</span>
            </RouterLink>

            <h1 className="text-5xl font-bold text-white-primary mb-6 leading-tight">
              Get Back to<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Smart Trading
              </span>
            </h1>

            <p className="text-xl text-white-muted mb-12 leading-relaxed">
              Access your institutional-grade alert platform and gain competitive advantage in the market.
            </p>

            {/* Benefits Grid */}
            <div className="space-y-6">
              {[
                { icon: Zap, title: '50K+ Events/Hour', desc: 'Real-time alert processing' },
                { icon: Gauge, title: '<100ms Latency', desc: 'Sub-second order execution' },
                { icon: Lock, title: 'Bank-Grade Security', desc: 'SOC 2 Type II Compliant' }
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg p-3" style={{ background: 'rgba(83, 240, 171, 0.15)' }}>
                    <benefit.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white-primary">{benefit.title}</h3>
                    <p className="text-sm text-white-muted">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="badge-platform" style={{ marginBottom: '16px', display: 'inline-block' }}>
                SIGN IN
              </div>
              <h2 className="text-4xl font-bold text-white-primary mb-2">Welcome back</h2>
              <p className="text-white-muted">
                Don't have an account?{' '}
                <RouterLink to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                  Create one
                </RouterLink>
              </p>
            </div>

            {/* Form Container */}
            <div className="rounded-3xl p-8 backdrop-blur-xl"
              style={{
                background: 'rgba(2, 7, 13, 0.5)',
                border: '1px solid rgba(83, 240, 171, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}>
              {/* Error Alert */}
              {error && (
                <Alert type="danger" onClose={() => setError('')} className="mb-6">
                  {error}
                </Alert>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Email */}
                <div>
                  <label className="form-label text-white-primary">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 placeholder-white-muted/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                    style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff', backgroundColor: '#0d1117' }}
                  />
                  {errors.email && <div className="form-error text-sm mt-1">{errors.email}</div>}
                </div>

                {/* Password */}
                <div>
                  <label className="form-label text-white-primary">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 pr-10 rounded-lg border border-emerald-500/30 placeholder-white-muted/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff', backgroundColor: '#0d1117' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white-muted hover:text-white-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <div className="form-error text-sm mt-1">{errors.password}</div>}
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <RouterLink
                    to="/forgot-password"
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Forgot password?
                  </RouterLink>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>


              </form>

              {/* Terms */}
              <p className="mt-6 text-center text-xs text-white-muted">
                By signing in, you agree to our{' '}
                <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  Terms
                </a>
                {' '}and{' '}
                <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
