from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv
import uuid
import time

load_dotenv()

# Cấu hình Flask với thư mục đúng
app = Flask(__name__, 
            static_folder='static',
            static_url_path='/static',
            template_folder='templates')
CORS(app)

# Cấu hình upload
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'heic', 'webp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Tạo thư mục uploads nếu chưa có
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Cấu hình Cloudinary (optional)
USE_CLOUDINARY = os.getenv('CLOUDINARY_URL') is not None
if USE_CLOUDINARY:
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
        api_key=os.getenv('CLOUDINARY_API_KEY'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET'),
        secure=True,
        timeout=120
    )

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_images_from_cloudinary():
    """Lấy tất cả ảnh từ Cloudinary"""
    try:
        result = cloudinary.api.resources(
            type="upload",
            prefix="locket_memories/",
            max_results=500,
            context=True  # Lấy metadata (caption)
        )
        
        images = []
        for resource in result['resources']:
            # Parse context để lấy caption
            caption = ''
            if 'context' in resource and 'custom' in resource['context']:
                caption = resource['context']['custom'].get('caption', '')
            
            image_data = {
                'id': resource['public_id'].split('/')[-1],  # Lấy ID từ public_id
                'filename': resource.get('original_filename', 'image') + '.' + resource['format'],
                'url': resource['secure_url'],
                'caption': caption,
                'uploaded_at': resource['created_at'],
                'storage': 'cloudinary',
                'cloudinary_id': resource['public_id']
            }
            images.append(image_data)
        
        # Sort by uploaded date (mới nhất trước)
        images.sort(key=lambda x: x['uploaded_at'], reverse=True)
        
        return images
    except Exception as e:
        print(f"Error fetching from Cloudinary: {str(e)}")
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gallery')
@app.route('/gallery.html')
def gallery():
    return render_template('gallery.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Không có file nào được gửi'}), 400
        
        file = request.files['file']
        caption = request.form.get('caption', '').strip()
        
        if file.filename == '':
            return jsonify({'error': 'Chưa chọn file'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Định dạng file không được hỗ trợ'}), 400
        
        # Tạo ID và tên file duy nhất
        image_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        original_filename = secure_filename(file.filename)
        filename = f"{timestamp}_{image_id[:8]}_{original_filename}"
        
        if USE_CLOUDINARY:
            # Reset file pointer về đầu
            file.seek(0)
            
            # Upload lên Cloudinary với retry và lưu caption vào context
            max_retries = 3
            retry_count = 0
            upload_success = False
            image_data = None
            
            while retry_count < max_retries and not upload_success:
                try:
                    print(f"🔄 Uploading to Cloudinary (attempt {retry_count + 1}/{max_retries}): {original_filename}")
                    result = cloudinary.uploader.upload(
                        file,
                        folder="locket_memories",
                        public_id=image_id,
                        resource_type="auto",
                        timeout=120,
                        context=f"caption={caption}"  # Lưu caption vào Cloudinary
                    )
                    print(f"✅ Cloudinary upload success: {result['secure_url']}")
                    
                    image_url = result['secure_url']
                    
                    # Lưu metadata
                    image_data = {
                        'id': image_id,
                        'filename': original_filename,
                        'url': image_url,
                        'caption': caption,
                        'uploaded_at': datetime.utcnow().isoformat() + 'Z',
                        'storage': 'cloudinary',
                        'cloudinary_id': result['public_id']
                    }
                    upload_success = True
                    
                except Exception as cloud_error:
                    retry_count += 1
                    print(f"⚠️ Cloudinary upload attempt {retry_count} failed: {str(cloud_error)}")
                    if retry_count < max_retries:
                        print(f"🔄 Retrying in 2 seconds...")
                        time.sleep(2)
                        file.seek(0)  # Reset file pointer
                    else:
                        print(f"❌ All Cloudinary upload attempts failed. Falling back to local storage.")
            
            # Nếu Cloudinary thất bại, fallback về local
            if not upload_success:
                print(f"💾 Falling back to local storage: {filename}")
                file.seek(0)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                image_data = {
                    'id': image_id,
                    'filename': filename,
                    'url': f'/static/uploads/{filename}',
                    'caption': caption,
                    'uploaded_at': datetime.utcnow().isoformat() + 'Z',
                    'storage': 'local'
                }
                
        else:
            print(f"💾 Saving locally: {filename}")
            # Lưu local
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Lưu metadata
            image_data = {
                'id': image_id,
                'filename': filename,
                'url': f'/static/uploads/{filename}',
                'caption': caption,
                'uploaded_at': datetime.utcnow().isoformat() + 'Z',
                'storage': 'local'
            }
        
        return jsonify({
            'success': True,
            'message': '💝 Ảnh đã được lưu vào kỷ niệm của chúng ta!',
            'image': image_data
        }), 200
            
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Lỗi khi tải ảnh lên: {str(e)}'}), 500

@app.route('/images', methods=['GET'])
def get_images():
    """Lấy danh sách ảnh - từ Cloudinary nếu có, fallback về local"""
    try:
        if USE_CLOUDINARY:
            # Lấy từ Cloudinary
            images = get_images_from_cloudinary()
            print(f"📸 Fetched {len(images)} images from Cloudinary")
        else:
            # Fallback: Lấy từ local
            images = []
            if os.path.exists(app.config['UPLOAD_FOLDER']):
                for filename in os.listdir(app.config['UPLOAD_FOLDER']):
                    if allowed_file(filename):
                        images.append({
                            'id': filename,
                            'filename': filename,
                            'url': f'/static/uploads/{filename}',
                            'caption': '',
                            'uploaded_at': datetime.utcnow().isoformat() + 'Z',
                            'storage': 'local'
                        })
        
        return jsonify({
            'success': True,
            'images': images,
            'count': len(images)
        }), 200
        
    except Exception as e:
        print(f"Get images error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Lỗi khi lấy danh sách ảnh: {str(e)}'}), 500

@app.route('/delete/<image_id>', methods=['DELETE'])
def delete_image(image_id):
    try:
        if USE_CLOUDINARY:
            # Xóa từ Cloudinary
            try:
                # Tìm public_id
                cloudinary_id = f"locket_memories/{image_id}"
                cloudinary.uploader.destroy(cloudinary_id)
                print(f"🗑️ Deleted from Cloudinary: {cloudinary_id}")
            except Exception as e:
                print(f"Cloudinary delete error: {str(e)}")
                return jsonify({'error': f'Lỗi khi xóa ảnh: {str(e)}'}), 500
        else:
            # Xóa local file
            filepath = os.path.join('static/uploads', image_id)
            if os.path.exists(filepath):
                os.remove(filepath)
        
        return jsonify({
            'success': True,
            'message': '🗑️ Đã xóa ảnh thành công!'
        }), 200
        
    except Exception as e:
        print(f"Delete error: {str(e)}")
        return jsonify({'error': f'Lỗi khi xóa ảnh: {str(e)}'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"🚀 Server starting on http://localhost:{port}")
    print(f"📁 Static folder: {app.static_folder}")
    print(f"📁 Template folder: {app.template_folder}")
    print(f"💾 Using Cloudinary: {USE_CLOUDINARY}")
    if USE_CLOUDINARY:
        print(f"☁️  Metadata stored on Cloudinary (persistent)")
    app.run(host='0.0.0.0', port=port, debug=True)