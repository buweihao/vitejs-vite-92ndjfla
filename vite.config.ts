import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 假设你的仓库名叫 optical-vision-demo
// 如果你的仓库名不一样，请修改下面的名字！
const repoName = 'vitejs-vite-92ndjfla'; 

export default defineConfig({
  // 关键修改：添加 base 路径，注意前后都要有斜杠
  base: `/${repoName}/`, 
  
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});