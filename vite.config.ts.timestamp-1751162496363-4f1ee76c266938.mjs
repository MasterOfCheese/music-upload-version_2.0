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
  // Đường dẫn cơ sở mặc định
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJvb3Q6ICcuJywgLy8gVGhcdTAxQjAgbVx1MUVFNWMgZ1x1MUVEMWMgY2hcdTFFRTlhIGluZGV4Lmh0bWxcbiAgcGx1Z2luczogW3Z1ZSgpXSwgLy8gUGx1Z2luIFZ1ZVxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLCAvLyBUaFx1MDFCMCBtXHUxRUU1YyBvdXRwdXRcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLCAvLyBUaFx1MDFCMCBtXHUxRUU1YyBjaFx1MUVFOWEgYXNzZXRzXG4gICAgc291cmNlbWFwOiBmYWxzZSwgLy8gVFx1MUVBRnQgc291cmNlbWFwIFx1MDExMVx1MUVDMyBnaVx1MUVBM20ga1x1MDBFRGNoIHRoXHUwMUIwXHUxRURCYyBidWlsZFxuICB9LFxuICBiYXNlOiAnLycsIC8vIFx1MDExMFx1MDFCMFx1MUVERG5nIGRcdTFFQUJuIGNcdTAxQTEgc1x1MUVERiBtXHUxRUI3YyBcdTAxMTFcdTFFQ0JuaFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogJy9zcmMnLCAvLyBBbGlhcyBcdTAxMTFcdTFFQzMgaW1wb3J0IGRcdTFFQzUgZFx1MDBFMG5nIGhcdTAxQTFuXG4gICAgfSxcbiAgfSxcbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFNBQVM7QUFFaEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBO0FBQUEsRUFDTixTQUFTLENBQUMsSUFBSSxDQUFDO0FBQUE7QUFBQSxFQUNmLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQTtBQUFBLElBQ1IsV0FBVztBQUFBO0FBQUEsSUFDWCxXQUFXO0FBQUE7QUFBQSxFQUNiO0FBQUEsRUFDQSxNQUFNO0FBQUE7QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUs7QUFBQTtBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
