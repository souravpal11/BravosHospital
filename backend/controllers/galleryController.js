const Gallery = require("../models/Gallery");

const addGalleryImage = async (req, res) => {

  try {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);


    const {
      title,
      description,
      category,
    } = req.body;


    if (!title) {

      return res.status(400).json({
        success: false,
        message: "Image title is required",
      });

    }


    if (!req.file) {

      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });

    }


    const imageUrl =
      `/uploads/gallery/${req.file.filename}`;


    const galleryImage =
      await Gallery.create({

        title: title,

        description:
          description || "",

        category:
          category || "Hospital",

        image: imageUrl,

      });


    res.status(201).json({

      success: true,

      message:
        "Gallery image uploaded successfully",

      galleryImage,

    });


  } catch (error) {

    console.error(
      "GALLERY ERROR:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        error.message ||
        "Unable to upload image",

    });

  }

};


const getGalleryImages = async (req, res) => {

  try {

    const images =
      await Gallery.find()
        .sort({ createdAt: -1 });


    res.status(200).json({

      success: true,

      images,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Unable to fetch gallery",

    });

  }

};


const deleteGalleryImage = async (req, res) => {

  try {

    const image =
      await Gallery.findById(
        req.params.id
      );


    if (!image) {

      return res.status(404).json({

        success: false,

        message:
          "Image not found",

      });

    }


    await Gallery.findByIdAndDelete(
      req.params.id
    );


    res.status(200).json({

      success: true,

      message:
        "Gallery image deleted",

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Unable to delete image",

    });

  }

};


module.exports = {
  addGalleryImage,
  getGalleryImages,
  deleteGalleryImage,
};