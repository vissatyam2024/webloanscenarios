import React, { useEffect, useState } from 'react';

const AnimatedBackground = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  
  useEffect(() => {
    // Set animation to complete after 4 seconds (matching the original animation duration)
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 4000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-screen h-screen overflow-hidden opacity-25 transform-gpu will-change-transform z-0">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 360 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          <linearGradient
            id="backgroundGradient"
            x1="50%"
            y1={isAnimating ? "100%" : "0%"}
            x2="50%"
            y2={isAnimating ? "0%" : "100%"}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#122027" stopOpacity="0.1" />
            <stop offset="40%" stopColor="#122027" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#122027" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#122027" stopOpacity="0.05">
              {isAnimating && (
                <animate
                  attributeName="offset"
                  values="0;1"
                  dur="4s"
                  repeatCount="1"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1"
                />
              )}
            </stop>
            {isAnimating && (
              <>
                <animate
                  attributeName="y1"
                  values="100%;0%"
                  dur="4s"
                  repeatCount="1"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1"
                />
                <animate
                  attributeName="y2"
                  values="200%;100%"
                  dur="4s"
                  repeatCount="1"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1"
                />
              </>
            )}
          </linearGradient>

        
        </defs>

        <g className={isAnimating ? "animate-pulse" : ""} style={{ willChange: 'opacity' }}>
        <path
  d="M268.514 790.74C268.514 790.74 268.513 538.535 268.514 396.113C268.514 326.119 358.022 240.833 358.022 240.833M238.842 791.235V396.113C238.842 259.629 358.516 67.7513 358.516 67.7513M209.171 791.235C209.171 791.235 209.171 551.887 209.171 395.618C209.171 238.739 278.899 0.00195312 278.899 0.00195312M298.185 791.235C298.185 791.235 298.185 528.644 298.185 396.113C298.185 358.107 360 320.946 360 320.946M327.856 791.235C327.856 791.235 327.856 507.875 327.856 395.618C327.856 379.719 359.011 369.409 359.011 369.409M90.4861 790.74C90.4861 790.74 90.4865 538.535 90.4861 396.113C90.4859 326.119 0.977909 240.833 0.977909 240.833M120.158 791.235V396.113C120.158 259.629 0.483569 67.7513 0.483569 67.7513M149.829 791.235C149.829 791.235 149.829 551.887 149.829 395.618C149.829 238.739 80.1014 0.00195312 80.1014 0.00195312M179.5 791.235V0.00195312M60.8151 791.235C60.8151 791.235 60.8148 528.644 60.8151 396.113C60.8151 358.107 -1 320.946 -1 320.946M31.1438 791.235C31.1438 791.235 31.1436 507.875 31.1438 395.618C31.1439 379.719 -0.0109457 369.409 -0.0109457 369.409"
  stroke="url(#backgroundGradient)"
  strokeWidth="0.7"
  filter="url(#glow)"
  style={{ willChange: 'transform' }}
/>
        </g>
      </svg>
    </div>
  );
};

export default React.memo(AnimatedBackground);