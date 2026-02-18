from PIL import Image
import numpy as np

def remove_white_background(input_path, output_path, threshold=240):
    try:
        img = Image.open(input_path).convert("RGBA")
        data = np.array(img)
        
        # Get RGB values
        r, g, b, a = data.T
        
        # Identify white areas (pixels where R, G, and B are all above threshold)
        white_areas = (r > threshold) & (g > threshold) & (b > threshold)
        
        # Set alpha to 0 for white areas
        data[..., 3][white_areas.T] = 0
        
        # Create new image
        new_img = Image.fromarray(data)
        new_img.save(output_path)
        print(f"Successfully processed {input_path} to {output_path}")
        
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    remove_white_background("D:\\KONYG\\public\\images\\floral_wreath_frame_original.png", "D:\\KONYG\\public\\images\\floral_wreath_transparent.png")
