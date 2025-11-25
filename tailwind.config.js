/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 这是你代码里用到的自定义颜色
        optics: {
          dark: '#0f172a', // 深色背景
          accent: '#22d3ee', // 亮青色强调
        },
      },
      // 这是你 SVG 动画需要的配置
      animation: {
        dash: 'dash 1s linear infinite',
      },
      keyframes: {
        dash: {
          to: {
            strokeDashoffset: '0',
          },
        },
      },
    },
  },
  plugins: [],
};
