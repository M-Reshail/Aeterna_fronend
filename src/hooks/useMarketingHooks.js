import { useEffect, useState } from 'react';

/**
 * useExitIntent - Detects when user is about to leave the page
 * Triggers callback when mouse moves towards window exit (top)
 * Debounced to prevent multiple triggers
 */
export const useExitIntent = (callback, options = {}) => {
  const {
    triggerThreshold = 10, // pixels from top of window
    cooldown = 60000, // milliseconds between triggers
    excludePaths = [] // URL paths to exclude
  } = options;

  useEffect(() => {
    let exitTriggered = false;
    let lastTriggerTime = 0;

    const handleMouseMove = (event) => {
      // Check if on excluded path
      if (excludePaths.includes(window.location.pathname)) {
        return;
      }

      // Check cooldown
      const now = Date.now();
      if (exitTriggered || (now - lastTriggerTime) < cooldown) {
        return;
      }

      // Detect exit attempt (mouse moving towards top of window)
      if (event.clientY <= triggerThreshold) {
        exitTriggered = true;
        lastTriggerTime = now;
        callback();
        
        // Reset flag after shorter delay so it can trigger again later
        setTimeout(() => {
          exitTriggered = false;
        }, 2000);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [callback, triggerThreshold, cooldown, excludePaths]);
};

/**
 * useScrollAnimation - Triggers animations when elements come into view
 */
export const useScrollAnimation = (ref, className = 'animate-fadeInUp') => {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, className]);
};

/**
 * useCountdownTimer - Manages countdown timer state
 */
export const useCountdownTimer = (expiresAt) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        totalSeconds: Math.floor(diff / 1000)
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft;
};

/**
 * useFormState - Manages form state with validation
 */
export const useFormState = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    setValues,
    errors,
    setErrors,
    touched,
    setTouched,
    handleChange,
    handleBlur,
    handleReset
  };
};

export default {
  useExitIntent,
  useScrollAnimation,
  useCountdownTimer,
  useFormState
};
