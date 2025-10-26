# 💝 Our Memories - Ứng dụng chia sẻ ảnh lãng mạn

Ứng dụng web lãng mạn giống Locket để chia sẻ và lưu giữ những khoảnh khắc đẹp nhất của hai người.

![Our Memories](https://img.shields.io/badge/Love-Forever-ff69b4)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-green)

## ✨ Tính năng

### 📸 Upload & Lưu trữ
- ✅ Upload ảnh từ máy tính hoặc điện thoại
- ✅ Thêm caption/mô tả cho mỗi ảnh
- ✅ Lưu trữ local hoặc Cloudinary (vĩnh viễn)
- ✅ Hỗ trợ nhiều định dạng: JPG, PNG, GIF, HEIC, WebP

### 🖼️ Gallery & Hiển thị
- ✅ Hiển thị tất cả ảnh trong gallery đẹp mắt
- ✅ Date stamps - Hiển thị ngày upload
- ✅ Captions - Mô tả cho mỗi ảnh
- ✅ Lightbox - Xem ảnh phóng to với điều hướng

### 🎬 Slideshow
- ✅ Tự động chuyển ảnh mỗi 4 giây
- ✅ Hiển thị caption và date
- ✅ Progress indicator
- ✅ Toàn màn hình

### 🔧 Quản lý
- ✅ Download ảnh về máy
- ✅ Delete ảnh với xác nhận
- ✅ Auto refresh gallery
- ✅ Responsive - Hoạt động tốt trên mobile

### 🎨 Giao diện
- ✅ Gradient background lãng mạn
- ✅ Floating hearts animation
- ✅ Smooth transitions
- ✅ Modern & clean design

## 🚀 Cài đặt & Chạy Local

### 1. Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/locket-memories.git
cd locket-memories
```

### 2. Tạo virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 4. Chạy ứng dụng

```bash
python app.py
```

Truy cập: `http://localhost:5000`

## ☁️ Deploy lên Render.com

### Bước 1: Chuẩn bị Repository

1. Push code lên GitHub:
```bash
git init
git add .
git commit -m "💝 Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/locket-memories.git
git push -u origin main
```

### Bước 2: Deploy trên Render

1. **Đăng ký/Đăng nhập**: https://render.com
2. **Tạo Web Service**:
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Chọn repository `locket-memories`

3. **Cấu hình**:
   ```
   Name: locket-memories
   Region: Singapore
   Branch: main
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   Instance Type: Free
   ```

4. **Deploy**: Click "Create Web Service"

### ⚠️ Lưu ý về Free Plan

**Render Free Plan sẽ XÓA ảnh khi restart** vì không có persistent storage.

**Giải pháp: Sử dụng Cloudinary (FREE & VĨNH VIỄN)**

## 💾 Cấu hình Cloudinary (Khuyến nghị)

### 1. Đăng ký Cloudinary

1. Truy cập: https://cloudinary.com
2. Sign Up Free
3. Xác nhận email

### 2. Lấy API credentials

1. Vào Dashboard
2. Copy 3 thông tin:
   - Cloud Name
   - API Key
   - API Secret

### 3. Thêm vào Render

1. Vào Render Dashboard → Your Service
2. Environment → Add Environment Variable
3. Thêm các biến:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Manual Deploy** → "Deploy latest commit"

### Giới hạn Cloudinary Free:
- ✅ 25GB storage
- ✅ 25GB bandwidth/tháng
- ✅ Lưu ảnh vĩnh viễn
- ✅ Đủ cho hàng nghìn ảnh!

## 📁 Cấu trúc Project

```
locket-memories/
├── app.py                    # Backend Flask
├── requirements.txt          # Python dependencies
├── index.html               # Frontend
├── images_metadata.json     # Metadata storage (auto-generated)
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── README.md               # Documentation
└── static/
    └── uploads/            # Local image storage
        └── .gitkeep       # Keep folder in git
```

## 🔧 API Endpoints

### POST /upload
Upload ảnh với caption

**Request:**
```
FormData:
  - file: image file
  - caption: string (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "💝 Ảnh đã được lưu vào kỷ niệm của chúng ta!",
  "image": {
    "id": "uuid",
    "url": "/static/uploads/image.jpg",
    "caption": "Beautiful moment",
    "uploaded_at": "2025-10-26T11:48:45Z"
  }
}
```

### GET /images
Lấy danh sách tất cả ảnh

**Response:**
```json
{
  "success": true,
  "images": [...],
  "count": 10
}
```

### DELETE /delete/<image_id>
Xóa ảnh

**Response:**
```json
{
  "success": true,
  "message": "🗑️ Đã xóa ảnh thành công!"
}
```

## 🎨 Tùy chỉnh

### Thay đổi màu sắc

Sửa trong `index.html`, phần CSS:

```css
/* Background gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Upload button */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Thay đổi thời gian slideshow

Sửa trong `index.html`, function `startSlideshow()`:

```javascript
// Từ 4 giây thành 5 giây
}, 5000);
```

## 🔐 Bảo mật

Để thêm authentication (chỉ 2 người truy cập):

1. Cài đặt Flask-Login
2. Tạo form đăng nhập
3. Bảo vệ các routes với `@login_required`

## 🐛 Troubleshooting

### Ảnh không hiển thị
- Kiểm tra quyền thư mục `static/uploads`
- Kiểm tra Cloudinary credentials

### Upload lỗi
- Kiểm tra file size (max 16MB)
- Kiểm tra định dạng file
- Xem logs trong console

### Deploy lỗi trên Render
- Kiểm tra `requirements.txt`
- Kiểm tra environment variables
- Xem Build logs

## 📝 License

MIT License - Tự do sử dụng cho mục đích cá nhân

## 💕 Credits

Được tạo với ❤️ bởi GitHub Copilot

---

**🎉 Chúc bạn và bạn gái có những khoảnh khắc tuyệt vời!**