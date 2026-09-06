import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cpu, Sliders, Layers, Sparkles, ShieldCheck } from 'lucide-react';

interface CapabilityDetailModalProps {
  title: string | null;
  onClose: () => void;
  onOpenClaimModal: (tier?: string) => void;
}

export const CapabilityDetailModal: React.FC<CapabilityDetailModalProps> = ({
  title,
  onClose,
  onOpenClaimModal,
}) => {
  if (!title) return null;

  const detailsMap: Record<
    string,
    {
      kicker: string;
      desc: string;
      features: string[];
      specs: { label: string; value: string }[];
    }
  > = {
    'AI Scenery': {
      kicker: 'Environmental Generative Engine',
      desc: 'Generates ultra-realistic space station interiors, planetary surface landscapes, and atmospheric lighting conditions on demand. Seamlessly converts CAD files into immersive spatial simulations.',
      features: [
        'Sub-millimeter terrain mesh generation from orbital LIDAR',
        'Dynamic atmospheric scattering and solar radiation modeling',
        'Zero-latency procedural vegetation and rock formation physics',
        'Instant light bake for multi-angle spacecraft renderings',
      ],
      specs: [
        { label: 'Render Resolution', value: '16K Spatial Stereo' },
        { label: 'Physics Engine', value: 'Quantum-Fluid v4.2' },
        { label: 'Latency', value: '< 2.4 ms' },
      ],
    },
    'Batch Production': {
      kicker: 'Automated Vessel Fleet Customization',
      desc: 'Rapidly configure and style full fleets of deep-space modules, habitat pods, and orbital landers in seconds with locked visual consistency across all mission documentation.',
      features: [
        'Unified livery and exterior heat-shield texture mapping',
        'Multi-angle automated social and broadcast asset export',
        'Real-time material degradation and space dust weathering presets',
        'Direct synchronization with aerospace telemetry dashboards',
      ],
      specs: [
        { label: 'Fleet Throughput', value: '500+ Assets / Min' },
        { label: 'Consistency Score', value: '99.98%' },
        { label: 'Color Accuracy', value: 'Rec. 2020 High Dynamic' },
      ],
    },
    'Smart Lighting': {
      kicker: 'Physically Accurate Stellar Illumination',
      desc: 'Simulates true solar irradiance across binary star systems, planetary eclipses, and nebula ambient glows. Calculates physically accurate ray tracing through vacuum and plasma.',
      features: [
        'Real-time solar flare and coronal mass ejection light simulation',
        'Subsurface scattering on lunar regolith and ice formations',
        'Zero-shadow artifacting via neural photon synthesis',
        'Synchronized day/night cycle simulation for Martian habitats',
      ],
      specs: [
        { label: 'Ray Bounces', value: 'Unbounded Spectral' },
        { label: 'Illumination Standards', value: 'ISO 20023 Aerospace' },
        { label: 'Spectral Range', value: '100nm - 12,000nm' },
      ],
    },
  };

  const info = detailsMap[title] || detailsMap['AI Scenery'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="liquid-glass-strong w-full max-w-xl rounded-3xl p-6 sm:p-8 text-white relative shadow-2xl border border-white/20 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="liquid-glass px-3 py-1 rounded-full text-xs font-medium text-white/90 font-body inline-flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-white" /> {info.kicker}
            </span>
          </div>

          <h2 className="font-heading italic text-3xl sm:text-4xl text-white tracking-tight mb-3">
            {title}
          </h2>

          <p className="text-sm font-body text-white/90 font-light leading-relaxed mb-6">
            {info.desc}
          </p>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {info.specs.map((spec) => (
              <div key={spec.label} className="liquid-glass rounded-xl p-3 text-center border border-white/10">
                <div className="text-[10px] font-body text-white/60 uppercase">{spec.label}</div>
                <div className="text-sm font-semibold font-body text-white mt-0.5">{spec.value}</div>
              </div>
            ))}
          </div>

          {/* Key Capabilities */}
          <div className="mb-6">
            <div className="text-xs font-body uppercase text-white/70 mb-2.5 font-medium tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Technical Highlights
            </div>
            <ul className="space-y-2">
              {info.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-xs font-body text-white/90 font-light">
                  <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenClaimModal('Martian Surface Descent');
              }}
              className="flex-1 bg-white text-black font-semibold rounded-full py-2.5 px-5 text-sm hover:bg-white/90 transition-colors font-body cursor-pointer shadow-lg text-center"
            >
              Deploy with {title}
            </button>
            <button
              onClick={onClose}
              className="liquid-glass rounded-full py-2.5 px-5 text-sm font-medium text-white hover:bg-white/20 transition-colors font-body cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
