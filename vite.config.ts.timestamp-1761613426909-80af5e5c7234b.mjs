// vite.config.ts
import { defineConfig } from "file:///C:/Users/Yazan/Desktop/plink-pay/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Yazan/Desktop/plink-pay/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tailwindcss from "file:///C:/Users/Yazan/Desktop/plink-pay/node_modules/@tailwindcss/vite/dist/index.mjs";
import flowbiteReact from "file:///C:/Users/Yazan/Desktop/plink-pay/node_modules/flowbite-react/dist/plugin/vite.js";
var vite_config_default = defineConfig({
  base: "/",
  // ensure asset paths work on OBS
  plugins: [react(), tailwindcss(), flowbiteReact()],
  build: { sourcemap: true },
  // helps debug if prod crashes
  server: {
    proxy: {
      // dev only: Vite forwards /api/v1 to your backend
      "/api/v1": {
        target: "http://101.46.58.237:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p
      },
      // Admin API routes
      "/api/admin": {
        target: "http://101.46.58.237:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxZYXphblxcXFxEZXNrdG9wXFxcXHBsaW5rLXBheVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcWWF6YW5cXFxcRGVza3RvcFxcXFxwbGluay1wYXlcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1lhemFuL0Rlc2t0b3AvcGxpbmstcGF5L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnXHJcbmltcG9ydCBmbG93Yml0ZVJlYWN0IGZyb20gJ2Zsb3diaXRlLXJlYWN0L3BsdWdpbi92aXRlJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBiYXNlOiAnLycsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW5zdXJlIGFzc2V0IHBhdGhzIHdvcmsgb24gT0JTXHJcbiAgcGx1Z2luczogW3JlYWN0KCksIHRhaWx3aW5kY3NzKCksIGZsb3diaXRlUmVhY3QoKV0sXHJcbiAgYnVpbGQ6IHsgc291cmNlbWFwOiB0cnVlIH0sICAgICAgICAgIC8vIGhlbHBzIGRlYnVnIGlmIHByb2QgY3Jhc2hlc1xyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgLy8gZGV2IG9ubHk6IFZpdGUgZm9yd2FyZHMgL2FwaS92MSB0byB5b3VyIGJhY2tlbmRcclxuICAgICAgJy9hcGkvdjEnOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEwMS40Ni41OC4yMzc6ODA4MCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgcmV3cml0ZTogKHApID0+IHBcclxuICAgICAgfSxcclxuICAgICAgLy8gQWRtaW4gQVBJIHJvdXRlc1xyXG4gICAgICAnL2FwaS9hZG1pbic6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTAxLjQ2LjU4LjIzNzo4MDgwJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICByZXdyaXRlOiAocCkgPT4gcFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRSLFNBQVMsb0JBQW9CO0FBQ3pULE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLG1CQUFtQjtBQUUxQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUE7QUFBQSxFQUNOLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxHQUFHLGNBQWMsQ0FBQztBQUFBLEVBQ2pELE9BQU8sRUFBRSxXQUFXLEtBQUs7QUFBQTtBQUFBLEVBQ3pCLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLE1BRUwsV0FBVztBQUFBLFFBQ1QsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsU0FBUyxDQUFDLE1BQU07QUFBQSxNQUNsQjtBQUFBO0FBQUEsTUFFQSxjQUFjO0FBQUEsUUFDWixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsUUFDUixTQUFTLENBQUMsTUFBTTtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
