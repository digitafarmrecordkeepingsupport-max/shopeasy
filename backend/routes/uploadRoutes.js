const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const folder = req.body.folder || 'shopeasy/products';

    // Handle Multipart File buffer
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) return res.status(500).json({ error: error.message });
          res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        }
      );
      return uploadStream.end(req.file.buffer);
    }

    // Handle base64 / URL string in json body
    if (req.body.image) {
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder,
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      });

      return res.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      });
    }

    res.status(400).json({ error: 'No image file or base64 provided' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
