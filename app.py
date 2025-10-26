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

load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='.')
CORS(app)

# Cấu hình
UPLOAD_FOLDER = 'static/uploads'
METADATA_FILE = 'images_metadata.json'
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
        api_secret=os.getenv('CLOUDINARY_API_SECRET')
    )

def load_metadata():
    """Load metadata từ file JSON"""
    if os.path.exists(METADATA_FILE):
        try:
            with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {'images': []}
    return {'images': []}

def save_metadata(metadata):
    """Lưu metadata vào file JSON"""
    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

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
        
        # Load metadata hiện tại
        metadata = load_metadata()
        
        if USE_CLOUDINARY:
            # Upload lên Cloudinary
            result = cloudinary.uploader.upload(
                file,
                folder="locket_memories",
                public_id=image_id,
                resource_type="auto"
            )
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
        else:
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
        
        # Thêm vào metadata và lưu
        metadata['images'].insert(0, image_data)  # Thêm vào đầu (mới nhất)
        save_metadata(metadata)
        
        return jsonify({
            'success': True,
            'message': '💝 Ảnh đã được lưu vào kỷ niệm của chúng ta!',
            'image': image_data
        }), 200
            
    except Exception as e:
        return jsonify({'error': f'Lỗi khi tải ảnh lên: {str(e)}'}), 500

@app.route('/images', methods=['GET'])
def get_images():
    try:
        metadata = load_metadata()
        
        # Sync với Cloudinary nếu đang dùng
        if USE_CLOUDINARY:
            try:
                result = cloudinary.api.resources(
                    type="upload",
                    prefix="locket_memories/",
                    max_results=500
                )
                # Update URLs từ Cloudinary (phòng trường hợp thay đổi)
                cloudinary_images = {r['public_id']: r['secure_url'] for r in result['resources']}
                for img in metadata['images']:
                    if img.get('storage') == 'cloudinary' and img.get('cloudinary_id') in cloudinary_images:
                        img['url'] = cloudinary_images[img['cloudinary_id']]
            except:
                pass  # Nếu lỗi thì dùng metadata cũ
        
        return jsonify({
            'success': True,
            'images': metadata['images'],
            'count': len(metadata['images'])
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Lỗi khi lấy danh sách ảnh: {str(e)}'}), 500

@app.route('/delete/<image_id>', methods=['DELETE'])
def delete_image(image_id):
    try:
        metadata = load_metadata()
        
        # Tìm ảnh cần xóa
        image_to_delete = None
        for img in metadata['images']:
            if img['id'] == image_id:
                image_to_delete = img
                break
        
        if not image_to_delete:
            return jsonify({'error': 'Không tìm thấy ảnh'}), 404
        
        # Xóa file
        if image_to_delete['storage'] == 'cloudinary':
            # Xóa từ Cloudinary
            cloudinary.uploader.destroy(image_to_delete['cloudinary_id'])
        else:
            # Xóa local file
            filepath = os.path.join('static/uploads', image_to_delete['filename'])
            if os.path.exists(filepath):
                os.remove(filepath)
        
        # Xóa khỏi metadata
        metadata['images'] = [img for img in metadata['images'] if img['id'] != image_id]
        save_metadata(metadata)
        
        return jsonify({
            'success': True,
            'message': '🗑️ Đã xóa ảnh thành công!'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Lỗi khi xóa ảnh: {str(e)}'}), 500

@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)