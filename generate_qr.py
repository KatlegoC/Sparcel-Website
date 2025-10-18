import qrcode
from PIL import Image, ImageDraw, ImageFont
import os

def generate_qr_code():
    # Generate unique bag ID
    bag_id = 'BAG' + str(int.from_bytes(os.urandom(3), 'big')).zfill(6)
    
    # Create URL with current local IP
    url = f"http://192.168.8.183:5173/?bag={bag_id}"
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create QR code image
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to RGB mode
    qr_img = qr_img.convert('RGB')
    
    # Create a new image with space for text at the bottom
    width, height = qr_img.size
    new_height = height + 60
    new_img = Image.new('RGB', (width, new_height), 'white')
    
    # Paste QR code onto new image
    new_img.paste(qr_img, (0, 0))
    
    # Add bag ID text at the bottom
    draw = ImageDraw.Draw(new_img)
    text = f"Bag ID: {bag_id}"
    
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except:
        font = ImageFont.load_default()
    
    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_x = (width - text_width) // 2
    text_y = height + 15
    
    draw.text((text_x, text_y), text, fill='black', font=font)
    
    # Save the image
    filename = f"sparcel_qr_{bag_id}.png"
    new_img.save(filename)
    
    print("\n" + "="*60)
    print("🎉 QR CODE GENERATED SUCCESSFULLY!")
    print("="*60)
    print(f"📦 Bag ID: {bag_id}")
    print(f"🔗 URL: {url}")
    print(f"💾 Saved as: {filename}")
    print("="*60)
    print("\nINSTRUCTIONS:")
    print("1. Make sure your phone is on the SAME WiFi network")
    print("2. Make sure the dev server is running with --host 0.0.0.0")
    print("3. Scan the QR code with your phone")
    print("4. Configure your parcel journey (FIRST SCAN)")
    print("5. Scan again to see the courier dashboard (SECOND SCAN)")
    print("="*60 + "\n")
    
    return bag_id, filename

if __name__ == "__main__":
    generate_qr_code()
