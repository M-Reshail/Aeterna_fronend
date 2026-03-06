# Integration Guide - MT5-Inspired Conversion Components

## Overview
This guide explains how to add the exit-intent popup, lead capture modal, benefits list, and countdown timer to your AETERNA Landing page.

## Components Available

### 1. **ExitIntentPopup**
Shows a special offer when user tries to leave the page.

```jsx
import { ExitIntentPopup } from '@/components/marketing/ConversonComponents';
import { useExitIntent } from '@/hooks/useMarketingHooks';

function MyComponent() {
  const [showExitPopup, setShowExitPopup] = useState(false);
  
  // Detect when user tries to leave
  useExitIntent(() => setShowExitPopup(true), {
    triggerThreshold: 10, // pixels from top
    cooldown: 60000, // milliseconds between triggers
    excludePaths: ['/checkout', '/thank-you'] // Don't show on these pages
  });

  return (
    <ExitIntentPopup 
      isOpen={showExitPopup}
      onClose={() => setShowExitPopup(false)}
      discount={15}
    />
  );
}
```

### 2. **LeadCaptureModal**
Collect emails with name and phone.

```jsx
import { LeadCaptureModal } from '@/components/marketing/ConversonComponents';
import { useState } from 'react';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (formData) => {
    // Send to your backend
    console.log('Form submitted:', formData);
    // API call here
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Get Access
      </button>
      
      <LeadCaptureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
```

### 3. **BenefitsList**
Display features/benefits with checkmarks.

```jsx
import { BenefitsList } from '@/components/marketing/ConversonComponents';

const benefits = [
  'Lifetime access - One-time payment',
  'Real-time market data',
  '30-day money-back guarantee',
  {
    title: 'Advanced Analytics',
    description: 'AI-powered market analysis for smarter decisions'
  },
  'Premium 24/7 support'
];

function MyComponent() {
  return <BenefitsList items={benefits} />;
}
```

### 4. **CountdownTimer**
Display real-time countdown to deadline.

```jsx
import { CountdownTimer } from '@/components/marketing/ConversonComponents';

function MyComponent() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2); // Expires in 2 hours

  return <CountdownTimer expiresAt={expiresAt} />;
}
```

---

## Complete Landing Page Example

```jsx
import React, { useState } from 'react';
import { ExitIntentPopup, LeadCaptureModal, BenefitsList, CountdownTimer } from '@/components/marketing/ConversonComponents';
import { useExitIntent } from '@/hooks/useMarketingHooks';
import Button from '@/components/common/Button';

export default function Landing() {
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Exit intent detection
  useExitIntent(() => setShowExitPopup(true), {
    cooldown: 120000, // Only show once every 2 minutes
    excludePaths: ['/pricing', '/checkout']
  });

  // Set expiration time (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const benefits = [
    'Unlimited alert monitoring',
    'Real-time price notifications',
    'Advanced portfolio analytics',
    '24/7 technical support',
    'API access included'
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-white-primary mb-6">
            Never Miss a Trading Opportunity
          </h1>
          <p className="text-white-muted text-lg mb-8">
            Real-time alerts, advanced analytics, and 24/7 support
          </p>

          {/* Countdown Timer */}
          <div className="mb-8 flex justify-center">
            <CountdownTimer expiresAt={expiresAt} />
          </div>

          <Button 
            onClick={() => setShowLeadModal(true)}
            variant="primary"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Features Section with Benefits */}
      <section className="py-20 px-4 bg-black-deep border-y border-black-card">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-white-primary text-center mb-12">
            Everything You Need
          </h2>
          <BenefitsList items={benefits} />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-white-primary mb-6">Simple Pricing</h2>
          <div className="glass p-8 rounded-2xl border border-emerald-500">
            <div className="text-white-primary text-lg mb-4">
              Premium Plan
            </div>
            <div className="text-5xl font-bold text-emerald-400 mb-2">
              $29
            </div>
            <p className="text-white-muted mb-8">/month or $299/year (Save $48)</p>
            
            <Button 
              onClick={() => setShowLeadModal(true)}
              variant="primary"
              className="w-full"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ExitIntentPopup
        isOpen={showExitPopup}
        onClose={() => setShowExitPopup(false)}
        discount={15}
      />

      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSubmit={(data) => {
          console.log('Lead captured:', data);
          // Send to backend/email service
        }}
      />
    </div>
  );
}
```

---

## Styling Notes

All components use your existing OLED design system:
- **Colors**: black-oled, white-primary, white-muted, emerald accents
- **Animations**: Uses `.animate-*` classes (fadeInUp, bounce, spin, pulse)
- **Borders**: Uses `.glass` class for glassmorphism effects
- **Responsive**: Mobile-first design with Tailwind breakpoints

---

## Customization

### Change Discount Percentage
```jsx
<ExitIntentPopup discount={20} /> // Show 20% off instead of 15%
```

### Change Modal Text
Edit the `ExitIntentPopup` component JSX directly to customize:
- Headline: "WAIT! Special Offer"
- Benefits list items
- Button text
- Footer message

### Change Timer Duration
```jsx
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours instead of 24
```

### Disable Exit Intent on Specific Pages
```jsx
useExitIntent(() => setShowExitPopup(true), {
  excludePaths: ['/checkout', '/dashboard', '/thank-you']
});
```

---

## Backend Integration

### Submitting Lead Data
When user submits the LeadCaptureModal form:

```jsx
const handleSubmit = async (formData) => {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      // Success - user sees success message
      console.log('Lead submitted successfully');
    }
  } catch (error) {
    console.error('Error submitting lead:', error);
  }
};
```

### Add to your backend router:
```javascript
// Example: Express.js
app.post('/api/leads', async (req, res) => {
  const { name, email, phone } = req.body;
  
  // Save to database
  // Send welcome email
  // Track in analytics
  
  res.json({ success: true });
});
```

---

## Analytics Integration

Track when users see these popups:

```javascript
// Segment/Mixpanel
analytics.track('Exit Intent Popup Shown', {
  discount: 15,
  timestamp: new Date()
});

analytics.track('Lead Modal Submitted', {
  email: formData.email,
  source: 'landing_page'
});
```

---

## Best Practices

1. **Timing**: Show exit popup only once per session (use cooldown)
2. **Mobile**: Lead modal works great for mobile capture
3. **A/B Testing**: Test different discount % (10%, 15%, 20%)
4. **Urgency**: Use real countdown timers (24-48 hours is optimal)
5. **Value**: Always list 3-5 specific benefits
6. **Copy**: Keep headlines short and CTA text action-oriented
7. **Analytics**: Track all interactions for optimization

---

## Troubleshooting

**Exit popup not showing?**
- Check browser console for errors
- Verify `useExitIntent` hook is initialized
- Check `excludePaths` - you might be on an excluded page
- Check cooldown timer hasn't prevented it from showing

**Modal form not submitting?**
- Verify backend endpoint exists and is accessible
- Check network tab in DevTools for failed requests
- Ensure form validation passes (all required fields filled)

**Animations not playing?**
- Verify animation classes in globals.css (you just added them)
- Check if Tailwind is processing the animation classes
- Try clearing browser cache

