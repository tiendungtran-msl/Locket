# 💝 Our Memories - Ứng dụng chia sẻ ảnh lãng mạn

Ứng dụng web lãng mạn với kiến trúc frontend module hóa, responsive hoàn hảo, và nhạc nền lãng mạn.

## ✨ Tính năng

### 📸 Trang chủ - Upload
- Upload ảnh với preview
- Thêm caption/mô tả
- Drag & drop support
- Paste from clipboard
- Character counter
- Success animation

### 🖼️ Trang Gallery - Xem kỷ niệm  
- Grid layout responsive
- Hiển thị caption & date
- Download & Delete buttons
- Auto refresh
- Empty state design

### 🔍 Lightbox
- Fullscreen view
- Keyboard navigation (←/→/ESC)
- Touch gestures
- Image preloading
- Zoom on double-click
- Download & Delete actions

### 🎬 Slideshow
- Auto-advance (4s/image)
- Play/Pause control
- Progress indicator
- Keyboard & touch navigation
- Smooth transitions

### 🎵 Music Player
- 3 romantic tracks
- Play/Pause toggle
- Volume control
- Track selection menu
- Persistent settings
- Keyboard shortcuts (Space, M, 1-3)

### 📱 Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop enhancement
- Landscape orientation support
- Touch-friendly controls

## 🎨 Kiến trúc Frontend

```
frontend/
├── index.html              # Trang upload
├── gallery.html            # Trang xem ảnh
├── css/
│   ├── common.css         # Styles chung (nav, music, footer...)
│   ├── home.css           # Styles trang chủ
│   ├── gallery.css        # Styles gallery, lightbox, slideshow
│   └── responsive.css     # Media queries cho mọi thiết bị
├── js/
│   ├── common.js          # Functions chung (API, date, message...)
│   ├── upload.js          # Logic upload (preview, drag-drop, paste)
│   ├── gallery.js         # Logic gallery (render, filter, delete)
│   ├── lightbox.js        # Logic lightbox (navigation, zoom)
│   ├── slideshow.js       # Logic slideshow (timer, controls)
│   └── music.js           # Logic nhạc (play, volume, tracks)
└── assets/
    └── music/
        ├── romantic1.mp3
        ├── romantic2.mp3
        └── romantic3.mp3
```

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/tiendungtran-msl/locket-memories.git
cd locket-memories
```

### 2. Tạo virtual environment

```bash
python -m venv venv
source venv/bin/activate  # Mac/Linux
# hoặc
venv\Scripts\activate  # Windows
```

### 3. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 4. Thêm nhạc nền

Tạo thư mục và thêm file nhạc:

```bash
mkdir -p static/music
# Copy 3 file nhạc romantic1.mp3, romantic2.mp3, romantic3.mp3 vào đây
```

### 5. Chạy ứng dụng

```bash
python app.py
```

Truy cập: `http://localhost:5000`

## 🎵 Cấu hình nhạc

### Nguồn nhạc miễn phí:
1. **YouTube Audio Library**: https://studio.youtube.com/
2. **Free Music Archive**: https://freemusicarchive.org/
3. **Bensound**: https://www.bensound.com/

### Gợi ý bài hát lãng mạn:
- Perfect - Ed Sheeran
- All of Me - John Legend
- A Thousand Years - Christina Perri
- Thinking Out Loud - Ed Sheeran
- Make You Feel My Love - Adele

### Chuyển đổi video sang MP3:
```bash
# Sử dụng ffmpeg
ffmpeg -i input.mp4 -vn -ar 44100 -ac 2 -b:a 192k output.mp3
```

## ⌨️ Keyboard Shortcuts

### Toàn bộ trang:
- `M` - Toggle music menu
- `Space` - Play/Pause music
- `1-3` - Switch music tracks
- `ESC` - Close modals/lightbox/slideshow

### Lightbox:
- `←/→` - Navigate images
- `D` - Download current image
- `Delete` - Delete current image
- `Double-click` - Zoom in/out

### Slideshow:
- `←/→` - Navigate slides
- `Space` - Play/Pause
- `ESC` - Exit slideshow

## 📱 Responsive Breakpoints

- **Mobile**: < 576px
- **Tablet Portrait**: 576px - 768px
- **Tablet Landscape**: 768px - 992px
- **Desktop**: 992px - 1200px
- **Large Desktop**: > 1200px

## 🎨 Tùy chỉnh màu sắc

Sửa trong `css/common.css`:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --success-color: #4CAF50;
    --danger-color: #f44336;
}
```

## ☁️ Deploy lên Render.com

### 1. Push lên GitHub

```bash
git add .
git commit -m "💝 Complete romantic app with music"
git push origin main
```

### 2. Deploy trên Render

1. Tạo Web Service mới
2. Connect GitHub repo
3. Cấu hình:
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app`
   - Instance: Free

### 3. Upload nhạc lên Cloudinary (nếu cần)

```python
# Script để upload nhạc
import cloudinary.uploader

cloudinary.uploader.upload(
    "static/music/romantic1.mp3",
    folder="locket_music",
    resource_type="video"
)
```

## 🐛 Troubleshooting

### Nhạc không phát:
- Kiểm tra file nhạc tồn tại trong `/static/music/`
- Đảm bảo định dạng MP3
- Check console browser cho lỗi

### Ảnh không hiển thị:
- Kiểm tra Cloudinary credentials (nếu dùng)
- Xem quyền thư mục `/static/uploads/`

### Layout vỡ trên mobile:
- Xóa cache browser
- Check viewport meta tag
- Test trên nhiều thiết bị

## 📄 License

MIT License - Free for personal use

## 💕 Credits

Made with ❤️ by @tiendungtran-msl
Powered by Flask, Vanilla JS, and Love

---

**🎉 Chúc bạn và bạn gái có những kỷ niệm đẹp!** 💝