const cloudinary = require('./cloudinary-config');

// Function to upload an image
function uploadImage(imagePath) {
  cloudinary.uploader.upload(imagePath, (error, result) => {
    if (error) {
      console.error('Upload failed:', error);
    } else {
      console.log('Upload successful:', result);
    }
  });
}

// Usage example
uploadImage('path/to/your/image.jpg');
