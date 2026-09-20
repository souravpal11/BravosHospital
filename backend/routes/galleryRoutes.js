const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  addGalleryImage,
  getGalleryImages,
  deleteGalleryImage,
} = require("../controllers/galleryController");

const router = express.Router();


// Upload directory
const uploadDirectory = path.join(
  __dirname,
  "../uploads/gallery"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}


// Multer storage
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {

    const extension = path.extname(
      file.originalname
    );

    const filename =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1000000000) +
      extension;

    cb(null, filename);
  },

});


const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// GET all gallery images
router.get("/", getGalleryImages);


// POST gallery image
router.post(
  "/",
  upload.single("image"),
  addGalleryImage
);


// DELETE gallery image
router.delete(
  "/:id",
  deleteGalleryImage
);


module.exports = router;