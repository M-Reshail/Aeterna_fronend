import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert } from '@components/common/UI';
import { useAuth } from '@hooks/useAuth';
import { validateEmail, validatePassword } from '@utils/helpers';
import { CheckCircle, Shield, Zap, Eye, EyeOff } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value, snapshot = formData) => {
    if (name === 'email') {
      if (!value.trim()) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email address';
      return '';
    }

    if (name === 'password') {
      if (!value) return 'Password is required';
      if (!validatePassword(value)) {
        return 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
      }
      return '';
    }

    if (name === 'confirmPassword') {
      if (!value) return 'Please confirm your password';
      if (snapshot.password !== value) return 'Passwords do not match';
      return '';
    }

    if (name === 'agreeToTerms') {
      if (!value) return 'You must agree to the terms of service';
      return '';
    }

    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    const emailError = validateField('email', formData.email, formData);
    const passwordError = validateField('password', formData.password, formData);
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword, formData);
    const termsError = validateField('agreeToTerms', formData.agreeToTerms, formData);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    if (termsError) newErrors.agreeToTerms = termsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => {
      const next = { ...prev, [name]: newValue };
      const nextErrors = { ...errors, [name]: validateField(name, newValue, next) };
      if (name === 'password' || name === 'confirmPassword') {
        nextErrors.confirmPassword = validateField('confirmPassword', next.confirmPassword, next);
      }
      setErrors(nextErrors);
      return next;
    });
  };

  const handleBlur = (e) => {
    const { name, type, value, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, fieldValue, formData) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData.email, formData.password, formData.confirmPassword);
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || err.message || '';

      let errorMsg;
      if (status === 409 || serverMsg.toLowerCase().includes('already')) {
        errorMsg = 'An account with this email already exists. Try signing in instead.';
      } else if (status === 422) {
        errorMsg = 'Invalid registration details. Please check your inputs and try again.';
      } else if (status === 429) {
        errorMsg = 'Too many registration attempts. Please wait a moment and try again.';
      } else if (err.code === 'ERR_NETWORK' || !navigator.onLine) {
        errorMsg = 'Unable to reach the server. Check your internet connection and try again.';
      } else if (serverMsg) {
        errorMsg = serverMsg;
      } else {
        errorMsg = 'Registration failed. Please try again or contact support.';
      }

      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-oled flex flex-col justify-start pt-16 pb-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(2, 7, 13, 0.95) 0%, rgba(4, 32, 40, 0.9) 100%)',
      }}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl w-full mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block">
            <RouterLink to="/" className="inline-flex items-center space-x-2 mb-7">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white-primary font-bold text-lg">Æ</span>
              </div>
              <span className="text-2xl font-bold text-white-primary">AETERNA</span>
            </RouterLink>

            <h1 className="text-5xl font-bold text-white-primary mb-4 leading-tight">
              Start Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Trading Journey
              </span>
            </h1>

            <p className="text-xl text-white-muted mb-6 leading-relaxed">
              Join thousands of professional traders using AETERNA for real-time alerts and institutional-grade insights.
            </p>

            {/* Benefits Grid */}
            <div className="space-y-6">
              {[
                { icon: Zap, title: 'Get Started in Minutes', desc: 'Simple onboarding process' },
                { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 Type II Compliant' },
                { icon: CheckCircle, title: '14-Day Free Trial', desc: 'Full access to all features' }
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
                GET STARTED
              </div>
              <h2 className="text-4xl font-bold text-white-primary mb-2">Create your account</h2>
              <p className="text-white-muted">
                Already have an account?{' '}
                <RouterLink to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                  Sign in
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
                      className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 placeholder-white-muted/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all pr-10"
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
                  <p className="text-xs text-white-muted/70 mt-2">
                    ✓ At least 8 characters with uppercase, lowercase, number & special character
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="form-label text-white-primary">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-emerald-500/30 placeholder-white-muted/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all pr-10"
                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff', backgroundColor: '#0d1117' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white-muted hover:text-white-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="form-error text-sm mt-1">{errors.confirmPassword}</div>}
                </div>

                {/* Terms Checkbox */}
                <div className="flex gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-white-muted cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {errors.agreeToTerms && <div className="form-error text-sm">{errors.agreeToTerms}</div>}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>


              </form>

              {/* Trial Info */}
              <div className="mt-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-300 text-center">
                  🎉 14-day free trial. No credit card required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
