const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'cloudinary', // ...existing code...
  api_key: '618296657646133',       // ...existing code...
  api_secret: 'G1qmhGZp9P3NegogCjCE1j8X5Bo'    // ...existing code...
});

module.exports = cloudinary;
