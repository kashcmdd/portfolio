import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, CheckCircle2, Sparkles, Rocket } from 'lucide-react';

interface ClaimSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTier?: string;
}

export const ClaimSpotModal: React.FC<ClaimSpotModalProps> = ({
  isOpen,
  onClose,
  defaultTier = 'Martian Surface Descent',
}) => {
  const [tier, setTier] = useState(defaultTier);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Mission Specialist');
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    const passCode = `AETH-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(passCode);
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="liquid-glass-strong w-full max-w-lg rounded-3xl p-6 sm:p-8 text-white relative shadow-2xl border border-white/20 overflow-hidden"
          >
            {/* Background ambient glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute top-5 right-5 p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="liquid-glass px-3 py-1 rounded-full text-xs font-medium text-white/90 font-body inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" /> 2026 Flight Manifest
                  </span>
                </div>

                <h2 className="font-heading italic text-3xl sm:text-4xl text-white tracking-tight mb-2">
                  Claim Your Voyage Pass
                </h2>
                <p className="text-sm font-body text-white/80 font-light mb-6">
                  Reserve your place aboard the maiden crewed mission to Mars. Early pass holders receive priority habitat allocation and personalized briefing access.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-body text-white/70 mb-1.5 uppercase tracking-wider">
                      Select Voyage Designation
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        'Orbital Recon',
                        'Martian Surface Descent',
                        'Deep Space Transit',
                      ].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setTier(option)}
                          className={`p-2.5 rounded-xl text-xs font-body transition-all text-center border cursor-pointer ${
                            tier === option
                              ? 'bg-white text-black font-semibold border-white shadow-lg'
                              : 'liquid-glass text-white/80 hover:text-white border-white/10 hover:border-white/30'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-body text-white/70 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Commander Sarah Connor"
                        className="w-full px-4 py-2.5 rounded-xl liquid-glass text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-body text-white/70 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 rounded-xl liquid-glass text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-body text-white/70 mb-1">Preferred Mission Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl liquid-glass text-sm text-white bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/10 font-body"
                    >
                      <option value="Mission Specialist" className="bg-black text-white">Mission Specialist</option>
                      <option value="Astrophysics Researcher" className="bg-black text-white">Astrophysics Researcher</option>
                      <option value="Space Habitat Engineer" className="bg-black text-white">Space Habitat Engineer</option>
                      <option value="Civilian Voyager" className="bg-black text-white">Civilian Voyager</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full liquid-glass-strong bg-white text-black font-semibold rounded-full py-3 px-6 text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all cursor-pointer shadow-lg"
                    >
                      Confirm Launch Reservation <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center mx-auto mb-4 text-white">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>

                <h3 className="font-heading italic text-3xl text-white tracking-tight mb-2">
                  Pass Confirmed
                </h3>
                <p className="text-sm font-body text-white/80 font-light max-w-sm mx-auto mb-6">
                  Welcome aboard, <span className="font-semibold text-white">{name}</span>. Your reservation for <span className="text-white italic">{tier}</span> is locked into the orbital manifest.
                </p>

                {/* Digital Boarding Pass Card */}
                <div className="liquid-glass rounded-2xl p-4 text-left mb-6 border border-white/20 relative">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                    <div>
                      <div className="text-[10px] font-body text-white/60 uppercase">Flight Designation</div>
                      <div className="text-sm font-semibold font-body text-white">AETHERIA MARS-01</div>
                    </div>
                    <Rocket className="w-5 h-5 text-white/80" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-body">
                    <div>
                      <span className="text-white/60 block text-[10px]">PASS CODE</span>
                      <span className="font-mono text-white text-sm">{ticketId}</span>
                    </div>
                    <div>
                      <span className="text-white/60 block text-[10px]">ROLE</span>
                      <span className="text-white font-medium">{role}</span>
                    </div>
                    <div>
                      <span className="text-white/60 block text-[10px]">DEPARTURE WINDOW</span>
                      <span className="text-white">Q3 2026</span>
                    </div>
                    <div>
                      <span className="text-white/60 block text-[10px]">LAUNCH COMPLEX</span>
                      <span className="text-white">Aetheria LC-39C</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetForm}
                  className="liquid-glass-strong rounded-full px-6 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  Close & Return to Launchpad
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
