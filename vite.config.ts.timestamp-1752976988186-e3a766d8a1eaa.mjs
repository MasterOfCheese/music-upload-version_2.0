// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import vue from "file:///home/project/node_modules/@vitejs/plugin-vue/dist/index.mjs";
var vite_config_default = defineConfig({
  root: ".",
  // Thư mục gốc chứa index.html
  plugins: [vue()],
  // Plugin Vue
  build: {
    outDir: "dist",
    // Thư mục output
    assetsDir: "assets",
    // Thư mục chứa assets
    sourcemap: false
    // Tắt sourcemap để giảm kích thước build
  },
  base: "/",
  // Sửa base thành '/' (đường dẫn cơ sở mặc định)
  resolve: {
    alias: {
      "@": "/src"
      // Alias để import dễ dàng hơn
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJvb3Q6ICcuJywgLy8gVGhcdTAxQjAgbVx1MUVFNWMgZ1x1MUVEMWMgY2hcdTFFRTlhIGluZGV4Lmh0bWxcbiAgcGx1Z2luczogW3Z1ZSgpXSwgLy8gUGx1Z2luIFZ1ZVxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLCAvLyBUaFx1MDFCMCBtXHUxRUU1YyBvdXRwdXRcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLCAvLyBUaFx1MDFCMCBtXHUxRUU1YyBjaFx1MUVFOWEgYXNzZXRzXG4gICAgc291cmNlbWFwOiBmYWxzZSwgLy8gVFx1MUVBRnQgc291cmNlbWFwIFx1MDExMVx1MUVDMyBnaVx1MUVBM20ga1x1MDBFRGNoIHRoXHUwMUIwXHUxRURCYyBidWlsZFxuICB9LFxuICBiYXNlOiAnLycsIC8vIFNcdTFFRURhIGJhc2UgdGhcdTAwRTBuaCAnLycgKFx1MDExMVx1MDFCMFx1MUVERG5nIGRcdTFFQUJuIGNcdTAxQTEgc1x1MUVERiBtXHUxRUI3YyBcdTAxMTFcdTFFQ0JuaClcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6ICcvc3JjJywgLy8gQWxpYXMgXHUwMTExXHUxRUMzIGltcG9ydCBkXHUxRUM1IGRcdTAwRTBuZyBoXHUwMUExblxuICAgIH0sXG4gIH0sXG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxTQUFTO0FBRWhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQTtBQUFBLEVBQ04sU0FBUyxDQUFDLElBQUksQ0FBQztBQUFBO0FBQUEsRUFDZixPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUE7QUFBQSxJQUNSLFdBQVc7QUFBQTtBQUFBLElBQ1gsV0FBVztBQUFBO0FBQUEsRUFDYjtBQUFBLEVBQ0EsTUFBTTtBQUFBO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLO0FBQUE7QUFBQSxJQUNQO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
