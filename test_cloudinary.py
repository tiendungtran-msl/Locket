import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os
from io import BytesIO
from PIL import Image

load_dotenv()

print("=" * 50)
print("KIỂM TRA CLOUDINARY CREDENTIALS")
print("=" * 50)
print(f"✓ CLOUDINARY_URL exists: {os.getenv('CLOUDINARY_URL') is not None}")
print(f"✓ Cloud Name: {os.getenv('CLOUDINARY_CLOUD_NAME')}")
print(f"✓ API Key: {os.getenv('CLOUDINARY_API_KEY')}")
print(f"✓ API Secret: {'***' + os.getenv('CLOUDINARY_API_SECRET')[-4:] if os.getenv('CLOUDINARY_API_SECRET') else 'MISSING'}")
print("=" * 50)

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

print("\n🔄 Testing upload to Cloudinary với file local...")

# Tạo ảnh test đơn giản
img = Image.new('RGB', (300, 200), color='red')
img_bytes = BytesIO()
img.save(img_bytes, format='PNG')
img_bytes.seek(0)

try:
    result = cloudinary.uploader.upload(
        img_bytes,
        folder="locket_test",
        public_id="test_upload",
        resource_type="image"
    )
    print(f"✅ UPLOAD THÀNH CÔNG!")
    print(f"📸 URL: {result['secure_url']}")
    print(f"📁 Public ID: {result['public_id']}")
    print(f"💾 Format: {result['format']}")
    print(f"📏 Size: {result['bytes']} bytes")
    
    # Test xóa
    print("\n🗑️ Testing delete...")
    cloudinary.uploader.destroy(result['public_id'])
    print("✅ XÓA THÀNH CÔNG!")
    
except Exception as e:
    print(f"❌ LỖI: {str(e)}")
    import traceback
    traceback.print_exc()