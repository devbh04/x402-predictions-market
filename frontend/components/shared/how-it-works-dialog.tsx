'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface HowItWorksDialogProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    number: 1,
    title: 'Pick a Market',
    description: "Buy 'Yes' or 'No' shares depending on your prediction. Buying shares is like betting on the outcome. Odds shift in real time as other traders bet.",
    image: '/1.webp',
  },
  {
    number: 2,
    title: 'Place a Bet',
    description: "Fund your account with crypto, credit/debit card, or bank transfer—then you're ready to bet. No bet limits and no fees.",
    image: '/2.webp',
  },
  {
    number: 3,
    title: 'Profit 🤑',
    description: "Sell your 'Yes' or 'No' shares at any time, or wait until the market ends to redeem winning shares for $1 each. Create an account and place your first trade in minutes.",
    image: '/3.png',
  },
];

export default function HowItWorksDialog({ open, onClose }: HowItWorksDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-zinc-900 border-yellow-400/30 p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-5 flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-yellow-400">How It Works</DialogTitle>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-yellow-400/30 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-8 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="group relative bg-zinc-800/50 rounded-2xl border border-zinc-700/50 hover:border-yellow-400/30 transition-all overflow-hidden"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:to-transparent transition-all duration-300" />
                  
                  <div className="relative">
                    {/* Image */}
                    <div className="w-full aspect-video bg-zinc-900/50 rounded-t-2xl overflow-hidden">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/30">
                          <span className="text-yellow-400 text-lg font-bold">{step.number}</span>
                        </div>
                        <h3 className="text-white text-xl font-bold">{step.title}</h3>
                      </div>
                      <p className="text-white/70 text-base leading-relaxed pl-13">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-8 text-center"
            >
              <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-6">
                <p className="text-white text-lg font-semibold mb-4">
                  Ready to start trading?
                </p>
                <button className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-all duration-300 shadow-lg shadow-yellow-400/20">
                  Create Account
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
