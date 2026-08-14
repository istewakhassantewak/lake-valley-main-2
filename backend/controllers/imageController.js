const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IMAGES_FILE = path.join(__dirname, '..', 'data', 'images.json');
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// Default initial images
const DEFAULT_IMAGES = [
  {
    id: 'gal-1',
    src: 'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg',
    alt: 'Lake Valley Flower City township aerial master view',
    title: 'Lake Valley Flower City Master Township',
    category: 'Township',
    targetSection: 'gallery',
    span: 'col-span-2 row-span-2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-2',
    src: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
    alt: 'Duplex City modern residential villa and boulevard',
    title: 'Duplex City Luxury Villas',
    category: 'Residential',
    targetSection: 'gallery',
    span: 'col-span-1 row-span-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-3',
    src: 'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
    alt: 'Green Garden Resort pool and garden area landscape',
    title: 'Green Garden Resort & Poolside',
    category: 'Resort',
    targetSection: 'gallery',
    span: 'col-span-1 row-span-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-4',
    src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    alt: 'Commercial Bangla Tower and corporate zone',
    title: 'Commercial Business Center & Bangla Tower',
    category: 'Commercial',
    targetSection: 'gallery',
    span: 'col-span-1 row-span-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-5',
    src: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
    alt: 'Eco Agro & Resort farmland lush green landscape',
    title: 'Eco Agro Farmland & Organic Orchards',
    category: 'Agro Tourism',
    targetSection: 'gallery',
    span: 'col-span-1 row-span-2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-6',
    src: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85',
    alt: 'Nature botanical park and serene lake walkway',
    title: 'Lakeside Botanical Walkway & Gardens',
    category: 'Nature',
    targetSection: 'gallery',
    span: 'col-span-1 row-span-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-7',
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    alt: 'Residential modern green housing architecture',
    title: 'Modern Eco Villa Community',
    category: 'Residential',
    targetSection: 'gallery',
    span: 'col-span-1 row-span-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-8',
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    alt: 'Serene sunset lake view at Lake Valley',
    title: 'Sunset Lakefront Promenade',
    category: 'Nature',
    targetSection: 'gallery',
    span: 'col-span-2 row-span-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-9',
    src: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85',
    alt: 'Clubhouse and luxury retreat facilities',
    title: 'Luxury Resort Clubhouse & Spa',
    category: 'Resort',
    targetSection: 'gallery',
    span: 'col-span-1 row-span-1',
    createdAt: new Date().toISOString(),
  },
];


function ensureStorage() {
  fs.mkdirSync(path.dirname(IMAGES_FILE), { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_FILE)) {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(DEFAULT_IMAGES, null, 2), 'utf8');
  }
}

function readImages() {
  ensureStorage();
  try {
    const content = fs.readFileSync(IMAGES_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_IMAGES;
  } catch {
    return DEFAULT_IMAGES;
  }
}

function writeImages(images) {
  ensureStorage();
  fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2), 'utf8');
}

// GET /api/images
exports.getAllImages = (req, res) => {
  try {
    const images = readImages();
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to read images: ' + err.message });
  }
};

// POST /api/images/upload (handles Base64 or raw file data)
exports.uploadImageFile = (req, res) => {
  try {
    const { base64Data, filename, title, category, alt, span, targetSection } = req.body;

    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'No base64Data provided' });
    }

    // Match base64 data uri prefix e.g., "data:image/png;base64,..."
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
    let imageBuffer;
    let extension = 'jpg';

    if (matches && matches.length === 3) {
      extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      imageBuffer = Buffer.from(matches[2], 'base64');
    } else {
      // Raw base64 string
      imageBuffer = Buffer.from(base64Data, 'base64');
    }

    ensureStorage();
    const uniqueName = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, imageBuffer);
    const publicUrl = `/uploads/${uniqueName}`;

    const newRecord = {
      id: `img-${Date.now()}`,
      src: publicUrl,
      title: title || filename || 'Uploaded Image',
      alt: alt || title || 'Uploaded Image',
      category: category || 'Township',
      targetSection: targetSection || 'gallery',
      span: span || 'col-span-1 row-span-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentImages = readImages();
    currentImages.unshift(newRecord);
    writeImages(currentImages);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: newRecord,
    });
  } catch (err) {
    console.error('Error uploading image file:', err);
    res.status(500).json({ success: false, message: 'Failed to upload image: ' + err.message });
  }
};

// POST /api/images (add image by URL or metadata)
exports.addImage = (req, res) => {
  try {
    const { src, title, alt, category, targetSection, span } = req.body;

    if (!src) {
      return res.status(400).json({ success: false, message: 'Image src URL is required' });
    }

    const newRecord = {
      id: `img-${Date.now()}`,
      src,
      title: title || 'New Image',
      alt: alt || title || 'New Image',
      category: category || 'Township',
      targetSection: targetSection || 'gallery',
      span: span || 'col-span-1 row-span-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentImages = readImages();
    currentImages.unshift(newRecord);
    writeImages(currentImages);

    res.status(201).json({ success: true, data: newRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add image: ' + err.message });
  }
};

// PUT /api/images/:id (update image details or replace image source)
exports.updateImage = (req, res) => {
  try {
    const { id } = req.params;
    const { src, title, alt, category, targetSection, span, base64Data } = req.body;

    const currentImages = readImages();
    const index = currentImages.findIndex((img) => String(img.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    let finalSrc = src || currentImages[index].src;

    // Handle replacement file if base64Data is provided
    if (base64Data) {
      const matches = base64Data.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
      let imageBuffer;
      let extension = 'jpg';

      if (matches && matches.length === 3) {
        extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        imageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        imageBuffer = Buffer.from(base64Data, 'base64');
      }

      ensureStorage();
      const uniqueName = `img_replaced_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;
      const filePath = path.join(UPLOADS_DIR, uniqueName);
      fs.writeFileSync(filePath, imageBuffer);
      finalSrc = `/uploads/${uniqueName}`;
    }

    const updatedRecord = {
      ...currentImages[index],
      src: finalSrc,
      title: title !== undefined ? title : currentImages[index].title,
      alt: alt !== undefined ? alt : currentImages[index].alt,
      category: category !== undefined ? category : currentImages[index].category,
      targetSection: targetSection !== undefined ? targetSection : currentImages[index].targetSection,
      span: span !== undefined ? span : currentImages[index].span,
      updatedAt: new Date().toISOString(),
    };

    currentImages[index] = updatedRecord;
    writeImages(currentImages);

    res.json({ success: true, message: 'Image updated successfully', data: updatedRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update image: ' + err.message });
  }
};

// DELETE /api/images/:id
exports.deleteImage = (req, res) => {
  try {
    const { id } = req.params;
    const currentImages = readImages();
    const filtered = currentImages.filter((img) => String(img.id) !== String(id));

    if (filtered.length === currentImages.length) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    writeImages(filtered);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete image: ' + err.message });
  }
};

// POST /api/images/reset
exports.resetImages = (req, res) => {
  try {
    writeImages(DEFAULT_IMAGES);
    res.json({ success: true, message: 'Images reset to defaults', data: DEFAULT_IMAGES });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset images: ' + err.message });
  }
};
