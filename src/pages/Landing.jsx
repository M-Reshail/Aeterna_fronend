import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/common/Button';
import { Alert } from '@components/common/UI';
import { Zap, Lock, Gauge, Brain, Clock, Shield, Activity, Cpu, Layers } from 'lucide-react';

export const Landing = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      name: 'Emily Chen',
      text: 'AETERNA has completely transformed how I monitor market opportunities. The alert aggregation saves me hours every day.'
    },
    {
      name: 'Amanda Rodriguez',
      text: 'I was skeptical at first, but after using AETERNA for a month, I can\'t imagine trading without it. The speed and accuracy are incredible.'
    },
    {
      name: 'Sarah Johnson',
      text: 'I\'ve tried many alert platforms, but AETERNA is in a league of its own. The AI filtering cuts through the noise perfectly.'
    },
    {
      name: 'Michael Thompson',
      text: 'The sub-second latency gives me a real edge. AETERNA\'s reliability and performance are exactly what professional traders need.'
    },
    {
      name: 'John Williams',
      text: 'AETERNA has become an essential part of my trading setup. The multi-source aggregation helps me stay ahead of the market.'
    },
    {
      name: 'David Kim',
      text: 'The platform\'s uptime and consistency are remarkable. I trust AETERNA to deliver critical alerts when it matters most.'
    },
    {
      name: 'Rachel Martinez',
      text: 'AETERNA\'s smart filtering is a game changer. I only see alerts that actually matter to my strategy, no more noise.'
    },
    {
      name: 'James Anderson',
      text: 'The 99.9% uptime SLA isn\'t just marketing - AETERNA delivers on it consistently. My trading depends on this reliability.'
    },
    {
      name: 'Lisa Park',
      text: 'Switching to AETERNA was the best decision I made this year. The edge it gives me in fast-moving markets is invaluable.'
    },
  ];

  const visibleTestimonials = 3;
  const totalSlides = Math.ceil(testimonials.length / visibleTestimonials);

  // Auto-slide every 12 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 12000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="badge-platform">
              <Zap className="w-4 h-4" />
              <span className="text-white-primary">Real-Time Alert Aggregation</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white-primary mb-8 leading-snug tracking-tight">
            Stop Watching.<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Start Trading Smart.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-white-muted mb-12 max-w-2xl mx-auto">
            Aggregate alerts from 50+ sources. Filter noise with AI. Execute faster than your competition.
            Sub-second latency. Enterprise-grade reliability.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Try Free for 14 Days
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="border border-slate-700 hover:border-emerald-500"
            >
              Watch Demo →
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 pt-12">
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">50K+</div>
              <div className="text-sm text-white-muted">Events/Hour</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">99.9%</div>
              <div className="text-sm text-white-muted">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">&lt;100ms</div>
              <div className="text-sm text-white-muted">Latency</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-800/50">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="badge-platform" style={{ marginBottom: 0 }}>
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">Institutional-Grade Alert Platform</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">Built for professional traders who need speed, reliability, and intelligence. Experience the future of alert aggregation.</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Multi-Source */}
          <div className="group relative rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl"
            style={{
              borderStyle: 'solid',
              borderWidth: '1px 0px 0px 1px',
              borderColor: '#53F0AB',
              backgroundImage: 'linear-gradient(to right, #000, #000, #0000, #1eb683)',
            }}>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-full" style={{ background: 'rgba(83, 240, 171, 0.15)' }}>
                <Zap className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Multi-Source Collection</h3>
              <p className="text-slate-300 mb-4 leading-relaxed">Ingest real-time alerts from 50+ blockchain networks, DEXs, CEXs, social feeds, and premium data sources.</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>50+ Data Sources</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>Multi-Chain Support</li>
              </ul>
            </div>
          </div>

          {/* Feature 2: Smart Filtering */}
          <div className="group relative rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl"
            style={{
              borderStyle: 'solid',
              borderWidth: '1px 0px 0px 1px',
              borderColor: '#53F0AB',
              backgroundImage: 'linear-gradient(to right, #000, #000, #0000, #1eb683)',
            }}>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-full" style={{ background: 'rgba(83, 240, 171, 0.15)' }}>
                <Brain className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Filtering</h3>
              <p className="text-slate-300 mb-4 leading-relaxed">Machine learning eliminates noise and surfaces only alerts that align with your trading strategy and risk profile.</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>99% Noise Reduction</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>Custom Rules Engine</li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Sub-Second Delivery */}
          <div className="group relative rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl"
            style={{
              borderStyle: 'solid',
              borderWidth: '1px 0px 0px 1px',
              borderColor: '#53F0AB',
              backgroundImage: 'linear-gradient(to right, #000, #000, #0000, #1eb683)',
            }}>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-full" style={{ background: 'rgba(83, 240, 171, 0.15)' }}>
                <Clock className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Sub-Second Delivery</h3>
              <p className="text-slate-300 mb-4 leading-relaxed">Edge-optimized infrastructure with global CDN ensures you receive critical alerts 10x faster than competitors.</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>&lt;100ms Latency</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>Global Infrastructure</li>
              </ul>
            </div>
          </div>

          {/* Feature 4: Enterprise Security */}
          <div className="group relative rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl"
            style={{
              borderStyle: 'solid',
              borderWidth: '1px 0px 0px 1px',
              borderColor: '#53F0AB',
              backgroundImage: 'linear-gradient(to right, #000, #000, #0000, #1eb683)',
            }}>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-full" style={{ background: 'rgba(83, 240, 171, 0.15)' }}>
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Enterprise Security</h3>
              <p className="text-slate-300 mb-4 leading-relaxed">Bank-grade encryption, SOC 2 Type II compliance, and institutional-level security protocols protect your data and strategies.</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>SOC 2 Compliance</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>End-to-End Encryption</li>
              </ul>
            </div>
          </div>

          {/* Feature 5: Real-Time Monitoring */}
          <div className="group relative rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl"
            style={{
              borderStyle: 'solid',
              borderWidth: '1px 0px 0px 1px',
              borderColor: '#53F0AB',
              backgroundImage: 'linear-gradient(to right, #000, #000, #0000, #1eb683)',
            }}>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-full" style={{ background: 'rgba(83, 240, 171, 0.15)' }}>
                <Activity className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Real-Time Monitoring</h3>
              <p className="text-slate-300 mb-4 leading-relaxed">Live dashboards and WebSocket APIs provide instant visibility into market movements, alerts, and performance metrics.</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>Live Dashboards</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>WebSocket APIs</li>
              </ul>
            </div>
          </div>

          {/* Feature 6: API & Integrations */}
          <div className="group relative rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl"
            style={{
              borderStyle: 'solid',
              borderWidth: '1px 0px 0px 1px',
              borderColor: '#53F0AB',
              backgroundImage: 'linear-gradient(to right, #000, #000, #0000, #1eb683)',
            }}>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-full" style={{ background: 'rgba(83, 240, 171, 0.15)' }}>
                <Layers className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">API & Integrations</h3>
              <p className="text-slate-300 mb-4 leading-relaxed">Seamless integration with your favorite trading bots, Discord, Telegram, and third-party platforms via comprehensive REST & WebSocket APIs.</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>REST & WebSocket APIs</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>3rd-Party Integrations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="px-4 sm:px-6 lg:px-8 py-28"
        style={{
          backgroundImage: 'url(https://cdn.shopify.com/s/files/1/0731/8090/5746/files/Frame-1321319036-scaled.webp?v=1749205067)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="badge-platform" style={{ marginBottom: 0 }}>TESTIMONIALS</div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4" style={{ color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
            What Our <span className="font-medium">Users Say</span>
          </h2>
          <p className="max-w-3xl mx-auto text-base md:text-lg mb-10" style={{ color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
            Our users love how AETERNA helps them stay ahead of the market, filter noise, and execute faster than the competition.
          </p>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="min-w-full grid grid-cols-1 md:grid-cols-3 gap-5 px-1"
                >
                  {testimonials
                    .slice(slideIndex * visibleTestimonials, (slideIndex + 1) * visibleTestimonials)
                    .map((item, idx) => (
                      <div
                        key={`${item.name}-${idx}`}
                        className="p-8 rounded-xl"
                        style={{
                          backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%)',
                          borderBottom: '1px solid #53F0AB',
                          minHeight: '150px',
                          fontFamily: '"Work Sans", sans-serif'
                        }}
                      >
                        <p className="text-left text-base leading-relaxed mb-4" style={{ color: '#ffffff' }}>
                          "{item.text}"
                        </p>
                        <p className="text-left font-semibold" style={{ color: '#ffffff' }}>{item.name}</p>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="transition-all duration-300"
                style={{
                  width: currentSlide === index ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: currentSlide === index ? '#53F0AB' : 'rgba(255, 255, 255, 0.3)',
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="px-4 sm:px-6 lg:px-8 py-32"
        style={{
          background: 'url(https://cdn.shopify.com/s/files/1/0731/8090/5746/files/FlooF-Home-page.webp?v=1749113736)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-light mb-2" style={{ color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
              Choose Your <span className="font-bold block">Plan</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start" style={{ perspective: '1000px' }}>
            {/* Starter Plan */}
            <div
              className="p-10 border border-gray-400"
              style={{
                backgroundImage: 'url(https://cdn.shopify.com/s/files/1/0731/8090/5746/files/Frame-2147225580.webp?v=1749301888)',
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
                minHeight: '700px',
                borderRadius: '40px',
                transform: 'rotateY(15deg) translateX(-10px)',
                transformStyle: 'preserve-3d',
                boxShadow: '-15px 15px 40px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="inline-block px-8 py-[18px] rounded-full border border-emerald-500/50 bg-gradient-to-b from-[#042318]/15 to-[#1EB683]/15 uppercase mb-6 hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300" style={{ fontSize: '18px', fontWeight: '400', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                Starter Package
              </div>

              <h3 className="font-bold mt-5" style={{ fontSize: '48px', fontWeight: '700', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>Free</h3>
              <h3 className="my-3" style={{ fontSize: '24px', fontWeight: '500', marginTop: '10px', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>AETERNA Starter License</h3>

              <button
                onClick={() => navigate('/register')}
                className="w-full mt-6 bg-emerald-500 hover:bg-transparent hover:border hover:border-emerald-500 py-3 px-8 rounded-full transition-all duration-300"
                style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}
              >
                Get Started
              </button>
              <p className="text-center my-4" style={{ fontSize: '16px', fontWeight: '400', margin: '10px auto 20px auto', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>available instantly</p>

              <img
                src="https://cdn.shopify.com/s/files/1/0731/8090/5746/files/Line-92.png?v=1749304159"
                alt="divider"
                className="w-full"
              />

              <ul className="mt-5 space-y-[15px]">
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Up to 50 alerts/day</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Email notifications</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Web dashboard access</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Basic filtering options</span>
                </li>
              </ul>
            </div>

            {/* Professional Plan */}
            <div
              className="rounded-3xl p-10 border border-gray-400"
              style={{
                backgroundImage: 'url(https://cdn.shopify.com/s/files/1/0731/8090/5746/files/Frame-2147225580.webp?v=1749301888)',
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
                minHeight: '560px',
                transform: 'translateY(30px)'
              }}
            >
              <div className="inline-block px-8 py-[18px] rounded-full border border-emerald-500/50 bg-gradient-to-b from-[#042318]/15 to-[#1EB683]/15 uppercase mb-6 hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300" style={{ fontSize: '18px', fontWeight: '400', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                Monthly License
              </div>

              <h3 className="font-bold mt-5" style={{ fontSize: '48px', fontWeight: '700', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                $49<span style={{ fontSize: '20px', fontWeight: '700', marginLeft: '8px', color: '#ffffff' }}>/month</span>
              </h3>
              <h3 className="my-3" style={{ fontSize: '24px', fontWeight: '500', marginTop: '10px', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>AETERNA Professional License</h3>

              <button
                onClick={() => navigate('/register')}
                className="w-full mt-6 bg-emerald-500 hover:bg-transparent hover:border hover:border-emerald-500 py-3 px-8 rounded-full transition-all duration-300"
                style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}
              >
                Start Free Trial
              </button>
              <p className="text-center my-4" style={{ fontSize: '16px', fontWeight: '400', margin: '10px auto 20px auto', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>14-day free trial included</p>

              <img
                src="https://cdn.shopify.com/s/files/1/0731/8090/5746/files/Line-92.png?v=1749304159"
                alt="divider"
                className="w-full"
              />

              <ul className="mt-5 space-y-[15px]">
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Unlimited alerts per day</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Email + Telegram notifications</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Advanced filtering & AI</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>REST API access</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div
              className="p-10 border border-gray-400"
              style={{
                backgroundImage: 'url(https://cdn.shopify.com/s/files/1/0731/8090/5746/files/Frame-2147225580.webp?v=1749301888)',
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
                minHeight: '700px',
                borderRadius: '40px',
                transform: 'rotateY(-15deg) translateX(10px)',
                transformStyle: 'preserve-3d',
                boxShadow: '15px 15px 40px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="inline-block px-8 py-[18px] rounded-full border border-emerald-500/50 bg-gradient-to-b from-[#042318]/15 to-[#1EB683]/15 uppercase mb-6 hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300" style={{ fontSize: '18px', fontWeight: '400', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                Enterprise Package
              </div>

              <h3 className="font-bold mt-5" style={{ fontSize: '48px', fontWeight: '700', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>Custom</h3>
              <h3 className="my-3" style={{ fontSize: '24px', fontWeight: '500', marginTop: '10px', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>AETERNA Enterprise License</h3>

              <button
                className="w-full mt-6 bg-emerald-500 hover:bg-transparent hover:border hover:border-emerald-500 py-3 px-8 rounded-full transition-all duration-300"
                style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}
              >
                Contact Sales
              </button>
              <p className="text-center my-4" style={{ fontSize: '16px', fontWeight: '400', margin: '10px auto 20px auto', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>tailored to your needs</p>

              <img
                src="https://cdn.shopify.com/s/files/1/0731/8090/5746/files/Line-92.png?v=1749304159"
                alt="divider"
                className="w-full"
              />

              <ul className="mt-5 space-y-[15px]">
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>WebSocket real-time API</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start" style={{ fontSize: '14px', paddingLeft: '40px', position: 'relative', color: '#ffffff', fontFamily: '"Work Sans", sans-serif' }}>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-white">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#ffffff' }}>✓</span>
                  </span>
                  <span>99.9% SLA guarantee</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, rgba(2, 16, 25, 0.95), rgba(4, 32, 40, 0.9)), url(https://cdn.shopify.com/s/files/1/0731/8090/5746/files/FlooF-Home-page.webp?v=1749113736)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Green gradient overlay at bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(16, 185, 129, 0.15) 100%)'
            }}
          ></div>

          {/* Content */}
          <div className="relative z-10 text-center py-20 px-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
              Sharpen your skills for the market
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-3xl mx-auto leading-relaxed">
              Immerse yourself in the dynamic world of the market. Feel the pulse of every candle as it forms, and learn to master your emotions and cultivate patience.
            </p>

            {subscribed ? (
              <Alert type="success" className="max-w-md mx-auto">
                Thanks for subscribing! Check your email for details.
              </Alert>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-emerald-500/50"
                >
                  Buy Now
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
