# SoundCloud Clone - Music Upload & Streaming Platform

Một ứng dụng clone SoundCloud được xây dựng với Vue 3, TypeScript, và Supabase.

## ✨ Tính năng

- 🎵 **Upload & Streaming**: Upload và phát nhạc trực tuyến
- 🌊 **Waveform Visualization**: Hiển thị dạng sóng âm thanh
- 💾 **Lưu trữ vĩnh viễn**: Tích hợp Supabase Storage
- 🎨 **UI/UX hiện đại**: Thiết kế đẹp mắt với Tailwind CSS
- 🌙 **Dark/Light Mode**: Chuyển đổi theme
- 📱 **Responsive**: Tối ưu cho mọi thiết bị
- ⚡ **Real-time**: Cập nhật dữ liệu thời gian thực

## 🚀 Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd soundcloud-clone
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình Supabase

#### Tạo Supabase Project
1. Truy cập [Supabase](https://supabase.com)
2. Tạo project mới
3. Lấy URL và Anon Key từ Settings > API

#### Cấu hình Environment Variables
```bash
# Tạo file .env từ .env.example
cp .env.example .env

# Cập nhật thông tin Supabase trong .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Chạy Migration
1. Truy cập Supabase Dashboard > SQL Editor
2. Copy nội dung file `supabase/migrations/create_tracks_table.sql`
3. Paste và chạy SQL

### 4. Chạy ứng dụng
```bash
npm run dev
```

## 📁 Cấu trúc thư mục

```
src/
├── components/          # Vue components
│   ├── EnhancedMusicPlayer.vue
│   ├── TrackCard.vue
│   ├── TrackItem.vue
│   ├── UploadComponent.vue
│   ├── WaveformDisplay.vue
│   └── ProgressBar.vue
├── lib/                 # Utilities & services
│   └── supabase.ts     # Supabase client & helpers
├── types/              # TypeScript types
│   └── Track.ts
├── App.vue             # Main app component
├── main.ts             # App entry point
└── style.css           # Global styles
```

## 🔧 Công nghệ sử dụng

- **Frontend**: Vue 3, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database + Storage)
- **Icons**: Heroicons
- **Audio**: Web Audio API

## 📱 Tính năng chính

### Upload File
- Hỗ trợ nhiều định dạng: MP3, WAV, FLAC, M4A, AAC, OGG
- Giới hạn kích thước: 150MB
- Drag & drop interface
- Progress tracking

### Music Player
- Play/Pause/Next/Previous
- Shuffle & Repeat modes
- Volume control
- Seek functionality
- Waveform visualization

### Storage Options
- **Supabase Storage**: Lưu trữ vĩnh viễn trên cloud
- **Local Storage**: Lưu trữ tạm thời trong browser

### UI Features
- Dark/Light theme
- Grid/List view modes
- Search & filter
- Responsive design
- Toast notifications

## 🔒 Bảo mật

- Row Level Security (RLS) enabled
- Public access policies (có thể tùy chỉnh)
- Secure file upload
- Environment variables protection

## 🚀 Deploy

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Vercel
```bash
npm run build
# Deploy dist/ folder to Vercel
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- GitHub: [Your GitHub]
- Email: [Your Email]

---

**Lưu ý**: Đây là project demo. Trong production, cần cấu hình authentication và authorization phù hợp.