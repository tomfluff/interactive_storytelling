import base64
from PIL import Image
from io import BytesIO


# Function to encode the image
def base64_encode_file(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def base64_image_url(image_path):
    # Encode image to base64 and str to send to llm
    base64_drawing = base64_encode_file(image_path)
    base64_url = f"data:image/jpeg;base64,{base64_drawing}"
    return base64_url


# TODO: Not sure if this is the best way to do this
def save_base64_image(base64_string, save_path):
    print("Saving image...")
    # Decode the base64 string
    image_data = base64.b64decode(base64_string)
    # Create an image object from the decoded data
    image = Image.open(BytesIO(image_data))
    # Save the image to the specified path
    print(f"Saving image to {save_path}")
    image.save(save_path)


def check_allowed_ext(extension, allowed_extensions):
    return extension in allowed_extensions
