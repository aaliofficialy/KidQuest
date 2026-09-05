import React, { useEffect, useState } from 'react';

// Friendly educational tips for children fallback
const CHILD_FRIENDLY_TIPS = [
  "⭐ Brain Tip: Practice 5 minutes of Math every day to become a Math Wizard!",
  "🎨 Drawing Tip: Mix Blue and Yellow to paint beautiful Green leaves!",
  "🚀 Science Tip: The moon doesn't make its own light, it reflects the sun's shine!",
  "🧠 Memory Tip: Pair cards by saying their names out loud to remember them faster!",
  "🍎 Health Tip: Eat colorful fruits like apples and berries to boost your brainpower!"
];

export const AdBanner: React.FC = () => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Cycle child-friendly learning tips every 12 seconds
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % CHILD_FRIENDLY_TIPS.length);
    }, 12000);

    // Try to trigger the adsbygoogle push
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      // Benign catch for adblockers
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-4">
      {/* Real AdSense / AdMob Web Ad Slot Container */}
      <div className="w-full max-w-[728px] bg-amber-50 border-2 border-dashed border-slate-400 rounded-xl overflow-hidden p-1 text-center">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase mb-0.5">
          Friendly Sponsor Zone
        </span>
        
        {/* Real Ad Tag */}
        <ins className="adsbygoogle"
             style={{ display: 'block', minHeight: '90px' }}
             data-ad-client="ca-app-pub-7905242732773199"
             data-ad-slot="7813643463"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>

        {/* Fallback Child-Friendly Learning Tip Panel */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 text-emerald-800 text-xs sm:text-sm font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 border border-emerald-200 mt-1">
          <span className="animate-bounce">💡</span>
          <span>{CHILD_FRIENDLY_TIPS[tipIndex]}</span>
        </div>
      </div>
    </div>
  );
};
