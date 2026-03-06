import React from 'react';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      className="mt-auto screen-edge bg-[#081012] bg-cover bg-no-repeat bg-bottom relative"
      style={{
        backgroundImage:
          "url('https://cdn.shopify.com/s/files/1/0731/8090/5746/files/Frame-1321319039.webp?v=1749209711')",
      }}
    >
      {/* Overlay to lighten the green at bottom */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(8, 16, 18, 0) 0%, rgba(8, 16, 18, 0.4) 100%)'
        }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-black-oled font-bold text-base">Æ</span>
              </div>
              <span className="text-white-primary text-xl font-semibold">AETERNA</span>
            </div>

            <div className="flex items-center gap-4 text-[#BDD1C7]">
              <a href="#facebook" className="transition-transform duration-300 ease-out hover:-translate-y-2 hover:text-white">
                <Facebook size={28} />
              </a>
              <a href="#instagram" className="transition-transform duration-300 ease-out hover:-translate-y-2 hover:text-white">
                <Instagram size={28} />
              </a>
              <a href="#youtube" className="transition-transform duration-300 ease-out hover:-translate-y-2 hover:text-white">
                <Youtube size={28} />
              </a>
              <a href="#twitter" className="transition-transform duration-300 ease-out hover:-translate-y-2 hover:text-white">
                <Twitter size={28} />
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-white text-2xl font-medium mb-4">Contacts</h5>
            <ul className="space-y-2 text-[#BDD1C7] text-base font-light">
              <li>WhatsApp: +92000000000</li>
              <li>
                Email:{' '}
                <a href="mailto:info@mt5simulator.com" className="text-[#64A320] hover:underline">
                  info@aeterna.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-2xl font-medium mb-4">Important Links</h5>
            <ul className="space-y-1">
              {[
                'Contact us',
                'Affiliate Program',
                'Cancel Subscriptions',
                'Refund policy',
                'Privacy Policy',
                'Terms and conditions',
                'FAQ',
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="inline-block w-full py-1.5 text-[#BDD1C7] text-base font-light transition-all duration-300 hover:text-white hover:border-b hover:border-emerald-400 hover:bg-[linear-gradient(180deg,rgba(83,240,171,0)_49.47%,rgba(83,240,171,0.40)_112.24%)]"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-white text-2xl font-medium mb-8">Subscribe to Our Emails</h5>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email here"
                className="w-full h-[45px] px-4 rounded-xl bg-white/10 border border-white/15 placeholder:text-white/50 outline-none"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff', backgroundColor: 'rgba(255,255,255,0.08)' }}
              />
              <button
                type="submit"
                className="h-[45px] w-[200px] rounded-xl text-base bg-emerald-500 text-white border border-emerald-500 transition-all duration-300 hover:bg-transparent hover:text-emerald-500"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
