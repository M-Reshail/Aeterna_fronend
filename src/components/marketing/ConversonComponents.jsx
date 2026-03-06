import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * ExitIntentPopup - Shows special offer when user moves mouse towards exit
 * Triggers when user moves mouse to top of window (exit behavior detection)
 */
export const ExitIntentPopup = ({ isOpen, onClose, discount = 15 }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!isOpen) return;
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black-oled bg-opacity-80 backdrop-blur-lg z-50 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-90vw max-w-2xl">
        <div className="bg-black-deep border border-black-card rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-emerald-700 rounded-full transition-smooth"
            >
              <X size={24} className="text-white" />
            </button>
            
            <div className="text-4xl mb-4 animate-bounce">⚡</div>
            <h2 className="text-3xl font-bold text-white mb-2">WAIT! Special Offer</h2>
            <p className="text-emerald-100 text-lg">Don't miss {discount}% OFF this opportunity</p>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Offer Box */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-8 mb-8 text-center border border-emerald-400">
              <div className="inline-block bg-black-oled text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
                LIMITED TIME OFFER - {timeLeft.hours}h {timeLeft.minutes}m left
              </div>
              <div className="flex items-center justify-center gap-4 my-6">
                <div className="text-2xl text-black-oled line-through">$299</div>
                <div className="text-5xl font-bold text-black-oled">${(299 * (1 - discount/100)).toFixed(2)}</div>
              </div>
              <p className="text-black-oled font-bold">SAVE ${(299 * discount/100).toFixed(2)} ({discount}% OFF)</p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {[
                'Unlimited access - One-time payment',
                '20+ years of real market data',
                '30-day money-back guarantee',
                'Premium 24/7 support included',
                'Instant activation'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 text-white-muted">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-black-oled text-sm font-bold">✓</span>
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black-oled font-bold py-4 px-6 rounded-full transition-smooth transform hover:scale-105 mb-3 text-lg shadow-lg">
              🔥 CLAIM {discount}% OFF NOW
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-white-muted hover:text-white-primary transition-smooth py-3 text-center underline"
            >
              No thanks, I'll pay full price later
            </button>
          </div>

          {/* Footer */}
          <div className="bg-emerald-600 bg-opacity-20 border-t border-emerald-500 px-8 py-4 text-center">
            <p className="text-white-muted text-sm font-semibold">
              Only {Math.floor(Math.random() * 5) + 3} spots left at this price
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * LeadCaptureModal - Email collection form with phone support
 */
export const LeadCaptureModal = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
      onSubmit && onSubmit(formData);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '' });
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black-oled bg-opacity-80 backdrop-blur-lg z-40 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 w-90vw max-w-md">
        <div className="glass rounded-2xl p-8 border border-black-card">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-black-card rounded-full transition-smooth"
          >
            <X size={20} className="text-white-muted hover:text-white-primary" />
          </button>

          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-white-primary mb-2">Get Premium Access</h2>
              <p className="text-white-muted mb-6">Join 1000+ successful traders</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white-muted text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-3 bg-black-card border border-black-hover rounded-lg text-white-primary placeholder-white-muted focus:border-emerald-500 focus:outline-none transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-white-muted text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-black-card border border-black-hover rounded-lg text-white-primary placeholder-white-muted focus:border-emerald-500 focus:outline-none transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-white-muted text-sm font-semibold mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 bg-black-card border border-black-hover rounded-lg text-white-primary placeholder-white-muted focus:border-emerald-500 focus:outline-none transition-smooth"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white-primary text-black-oled font-bold py-3 rounded-full hover:shadow-glow transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-black-oled border-t-transparent rounded-full animate-spin"></div>}
                  {loading ? 'Processing...' : 'Get Access Now'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Success!</h3>
              <p className="text-white-muted">Check your email for next steps</p>
            </div>
          )}

          <p className="text-center text-white-muted text-xs mt-6">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </>
  );
};

/**
 * BenefitsList - Checklist of features/benefits
 */
export const BenefitsList = ({ items = [] }) => {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3 group">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:shadow-glow transition-smooth">
            <span className="text-black-oled text-sm font-bold">✓</span>
          </div>
          <div className="pt-0.5">
            <p className="text-white-primary font-medium">
              {typeof item === 'string' ? item : item.title}
            </p>
            {typeof item !== 'string' && item.description && (
              <p className="text-white-muted text-sm mt-1">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * CountdownTimer - Real-time countdown display
 */
export const CountdownTimer = ({ expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeLeft) return <div className="text-emerald-400 font-bold">Offer Expired</div>;

  return (
    <div className="bg-black-card border border-emerald-500 rounded-lg p-4 inline-block">
      <div className="flex gap-6 items-center">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds }
        ].map((unit, idx) => (
          <div key={idx} className="text-center">
            <div className="text-2xl font-bold text-emerald-400 text-white-primary">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-xs text-white-muted uppercase tracking-wide mt-1">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  ExitIntentPopup,
  LeadCaptureModal,
  BenefitsList,
  CountdownTimer
};
