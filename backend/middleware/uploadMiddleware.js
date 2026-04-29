const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'assignments',
    resource_type: 'raw', // Important for PDFs and other non-image files
    public_id: (req, file) => {
      // Remove extension and add timestamp for uniqueness
      const fileName = file.originalname.split('.')[0];
      return `${Date.now()}-${fileName}`;
    }
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
