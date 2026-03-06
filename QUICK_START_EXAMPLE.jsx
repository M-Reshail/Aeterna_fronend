import React, { useState } from 'react';
import { ExitIntentPopup, LeadCaptureModal, BenefitsList, CountdownTimer } from '@/components/marketing/ConversonComponents';
import { useExitIntent } from '@/hooks/useMarketingHooks';
import Button from '@/components/common/Button';

/**
 * QUICK START EXAMPLE - How to use MT5-inspired conversion components
 * 
 * This shows how to integrate the new marketing components into your Landing page.
 * Copy and paste the sections you want into your existing Landing.jsx
 */

export default function LandingWithConversions() {
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // 1. SETUP: Auto-detect when user tries to leave and show special offer
  useExitIntent(() => setShowExitPopup(true), {
    triggerThreshold: 10, // pixels from top of window
    cooldown: 120000, // only show once every 2 minutes
    excludePaths: ['/checkout', '/thank-you'] // don't show on these pages
  });

  // 2. SETUP: Set offer expiration (24 hours from now)
  const offerExpires = new Date();
  offerExpires.setHours(offerExpires.getHours() + 24);

  // 3. DATA: List of features/benefits for your platform
  const premiumFeatures = [
    'Real-time price alerts for crypto markets',
    'Advanced portfolio tracking and analytics',
    'AI-powered trading signals and predictions',
    '24/7 dedicated customer support via email and chat',
    'API access for advanced integrations',
    'Historical data and backtesting tools'
  ];

  return (
    <div className="w-full">
      
      {/* ========== HERO SECTION ========== */}
      <section className="py-20 px-4 md:py-32 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Hero Headline */}
          <h1 className="text-white-primary mb-6">
            The Smarter Way to Trade Crypto
          </h1>
          
          <p className="text-white-muted text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Get real-time alerts, advanced analytics, and AI-powered insights 
            to make better trading decisions.
          </p>

          {/* COUNTDOWN TIMER - Add urgency! */}
          <div className="mb-12 flex justify-center">
            <CountdownTimer expiresAt={offerExpires} />
          </div>

          {/* OFFER MESSAGE */}
          <p className="text-emerald-400 font-semibold mb-8">
            Limited time: Get 15% OFF all premium plans
          </p>

          {/* PRIMARY CTA BUTTON */}
          <Button 
            onClick={() => setShowLeadModal(true)}
            variant="primary"
            size="lg"
            className="mb-4"
          >
            Start Free Trial
          </Button>

          <p className="text-white-muted text-sm">
            No credit card required • Access for 14 days
          </p>
        </div>
      </section>

      {/* ========== SOCIAL PROOF SECTION ========== */}
      <section className="py-16 px-4 bg-black-deep border-y border-black-card">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">50k+</div>
              <p className="text-white-muted text-sm">Active Traders</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">$2.5B</div>
              <p className="text-white-muted text-sm">Monitored Assets</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">99.9%</div>
              <p className="text-white-muted text-sm">Uptime SLA</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">24/7</div>
              <p className="text-white-muted text-sm">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION WITH BENEFITS LIST ========== */}
      <section className="py-20 px-4 md:py-32 md:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-white-primary mb-4">
              Everything You Need to Trade Smart
            </h2>
            <p className="text-white-muted text-lg">
              Powerful tools designed for both beginners and professionals
            </p>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* LEFT: Features */}
            <div>
              <h3 className="text-2xl font-bold text-white-primary mb-6">
                Premium Features
              </h3>
              
              {/* BENEFITS LIST COMPONENT - Shows checkmarks + descriptions */}
              <BenefitsList items={premiumFeatures} />
            </div>

            {/* RIGHT: Video or image placeholder */}
            <div className="glass rounded-xl p-8 flex items-center justify-center h-96 border border-emerald-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-white-muted">Your trading dashboard here</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PRICING SECTION ========== */}
      <section className="py-20 px-4 md:py-32 md:px-8 bg-black-deep">
        <div className="max-w-4xl mx-auto">
          
          <h2 className="text-white-primary text-center mb-16">
            Simple, Transparent Pricing
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* BASIC PLAN */}
            <div className="glass border border-black-card rounded-xl p-8">
              <h3 className="text-xl font-bold text-white-primary mb-2">
                Starter
              </h3>
              <p className="text-white-muted mb-6">For learning traders</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-white-primary">$9</span>
                <span className="text-white-muted ml-2">/month</span>
              </div>

              <Button variant="secondary" className="w-full mb-4">
                Choose Plan
              </Button>

              <div className="space-y-3 text-sm">
                <p className="text-white-muted">✓ Up to 10 alerts</p>
                <p className="text-white-muted">✓ Basic analytics</p>
                <p className="text-white-muted">✓ Email support</p>
              </div>
            </div>

            {/* PRO PLAN - HIGHLIGHTED */}
            <div className="glass border-2 border-emerald-500 rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-black-oled px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>

              <h3 className="text-xl font-bold text-white-primary mb-2">
                Professional
              </h3>
              <p className="text-emerald-400 mb-6 font-semibold">15% SAVINGS</p>
              
              <div className="mb-6">
                <span className="line-through text-white-muted">$34</span>
                <span className="text-4xl font-bold text-emerald-400 ml-2">$29</span>
                <span className="text-white-muted ml-2">/month</span>
              </div>

              <Button 
                onClick={() => setShowLeadModal(true)}
                variant="primary" 
                className="w-full mb-4"
              >
                Get Started Free
              </Button>

              <div className="space-y-3 text-sm">
                <p className="text-white-primary">✓ Unlimited alerts</p>
                <p className="text-white-primary">✓ Advanced analytics</p>
                <p className="text-white-primary">✓ AI predictions</p>
                <p className="text-white-primary">✓ Priority support</p>
              </div>
            </div>
          </div>

          {/* MONEY BACK GUARANTEE */}
          <div className="text-center mt-12">
            <div className="text-2xl mb-2">🛡️</div>
            <p className="text-white-primary font-semibold mb-1">
              30-Day Money-Back Guarantee
            </p>
            <p className="text-white-muted">
              Not satisfied? Get a full refund, no questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-20 px-4 md:py-32 md:px-8">
        <div className="max-w-2xl mx-auto text-center glass border border-emerald-500 rounded-2xl p-12">
          <h2 className="text-white-primary mb-4">
            Ready to Start Trading Smarter?
          </h2>
          <p className="text-white-muted mb-8">
            Join thousands of traders using ATERNA to make better decisions
          </p>
          
          <Button 
            onClick={() => setShowLeadModal(true)}
            variant="primary"
            size="lg"
          >
            Get 14-Day Free Trial
          </Button>

          <p className="text-white-muted text-sm mt-4">
            Activation takes 2 minutes. No payment method required.
          </p>
        </div>
      </section>

      {/* ========== EXIT INTENT POPUP ========== */}
      {/* 
        This automatically shows when user moves mouse to top of page
        (Configured by useExitIntent hook above)
      */}
      <ExitIntentPopup
        isOpen={showExitPopup}
        onClose={() => setShowExitPopup(false)}
        discount={15}
      />

      {/* ========== LEAD CAPTURE MODAL ========== */}
      {/* 
        Shows when user clicks "Get Started" or "Start Free Trial" buttons
        Collects name, email, phone for follow-up
      */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSubmit={(formData) => {
          console.log('Lead submitted:', formData);
          
          // TODO: Send to your backend API
          // API call example:
          // fetch('/api/leads', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(formData)
          // });

          // TODO: Send welcome email
          // TODO: Track in analytics (Segment, Mixpanel, etc.)
        }}
      />
    </div>
  );
}

/**
 * ========== HOW TO USE THIS FILE ==========
 * 
 * 1. Copy the sections you want from this file
 * 2. Paste them into your existing Landing.jsx
 * 3. Import the components at the top:
 *    - import { ExitIntentPopup, LeadCaptureModal, BenefitsList, CountdownTimer } from '@/components/marketing/ConversonComponents';
 *    - import { useExitIntent } from '@/hooks/useMarketingHooks';
 * 
 * 4. Use the sections:
 *    - Copy the jsx markup from each <section>
 *    - Copy the state/hooks initialization code
 *    - Customize the text/data for your platform
 * 
 * 5. Customize:
 *    - Change colors by replacing emerald-* with your brand color
 *    - Change text/headlines to match your messaging
 *    - Update feature lists with your actual features
 *    - Update pricing tiers and prices
 * 
 * 6. Connect to backend:
 *    - In the LeadCaptureModal onSubmit callback
 *    - Send form data to your API endpoint
 *    - Store leads in database
 *    - Send welcome email
 * 
 * ========== KEY COMPONENTS ==========
 * 
 * ExitIntentPopup:
 *   - Shows special offer (15% off)
 *   - Triggers when user tries to leave
 *   - Cooldown prevents spam
 *   - Use with useExitIntent hook
 * 
 * LeadCaptureModal:
 *   - Collects name, email, phone
 *   - Shows loading spinner
 *   - Success confirmation
 *   - Call onSubmit to handle form data
 * 
 * BenefitsList:
 *   - Shows feature checklist
 *   - Green checkmarks with hover glow
 *   - Supports two-line items (title + description)
 *   - Pass array of strings or objects
 * 
 * CountdownTimer:
 *   - Real-time countdown display
 *   - Days/Hours/Minutes/Seconds
 *   - Green accent colors
 *   - Passes expiresAt prop
 * 
 * ========== CONVERSION OPTIMIZATION TIPS ==========
 * 
 * ✓ Use clear, benefit-focused headlines
 * ✓ Show social proof (users, assets, uptime)
 * ✓ Add countdown timer for urgency
 * ✓ Use exit popup for last-chance offers
 * ✓ Make CTA buttons button bright (emerald/white)
 * ✓ List 3-5 top benefits clearly
 * ✓ Show guarantee (money-back, free trial)
 * ✓ Simple form fields (name, email, optional phone)
 * ✓ Mobile responsive layout
 * ✓ Track all clicks for analytics
 */
