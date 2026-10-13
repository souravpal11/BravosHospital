import React, { useEffect, useState } from "react";
import api from "../config/api";
import getImageUrl from "../config/imageUrl";

const AdminGallery = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Facilities");
  const [image, setImage] = useState(null);

  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    try {
      const response = await api.get("/api/gallery");

      setImages(response.data.images || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image");

      return;
    }

    const formData = new FormData();

    formData.append("title", title);

    formData.append("description", description);

    formData.append("category", category);

    formData.append("image", image);

    try {
      setLoading(true);

      await api.post("/api/gallery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Image uploaded successfully!");

      setTitle("");
      setDescription("");
      setCategory("Facilities");
      setImage(null);

      document.getElementById("galleryImage").value = "";

      fetchImages();
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Unable to upload image");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/gallery/${id}`);

      fetchImages();
    } catch (error) {
      console.error(error);

      alert("Unable to delete image");
    }
  };

  return (
    <div className="admin-gallery">
      <div className="container-fluid">
        {/* HEADER */}

        <div className="admin-gallery-header">
          <div>
            <span>CONTENT MANAGEMENT</span>

            <h2>Hospital Gallery</h2>

            <p>Upload and manage hospital images displayed on the website.</p>
          </div>
        </div>

        <div className="row g-4">
          {/* UPLOAD */}

          <div className="col-lg-4">
            <div className="gallery-upload-card">
              <h4>Upload New Image</h4>

              <p>Add a new image to the hospital gallery.</p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Image Title</label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Hospital Reception"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Category</label>

                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Facilities</option>

                    <option>Doctors</option>

                    <option>Events</option>

                    <option>Departments</option>

                    <option>Hospital</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label>Description</label>

                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Short description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label>Hospital Image</label>

                  <input
                    id="galleryImage"
                    type="file"
                    className="form-control"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setImage(e.target.files[0])}
                    required
                  />

                  <small>JPG, PNG or WEBP · Max 5MB</small>
                </div>

                <button
                  type="submit"
                  className="gallery-upload-btn"
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload Image"}

                  {!loading && <i className="bi bi-cloud-arrow-up ms-2"></i>}
                </button>
              </form>
            </div>
          </div>

          {/* EXISTING IMAGES */}

          <div className="col-lg-8">
            <div className="gallery-manage-card">
              <div className="gallery-manage-header">
                <div>
                  <span>GALLERY</span>

                  <h4>Uploaded Images</h4>
                </div>

                <strong>{images.length} Images</strong>
              </div>

              <div className="row g-3">
                {images.map((item) => (
                  <div className="col-md-6" key={item._id}>
                    <div className="admin-gallery-item">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title || "Hospital gallery"}
                      />

                      <div className="admin-gallery-item-body">
                        <div>
                          <span>{item.category}</span>

                          <h5>{item.title}</h5>
                        </div>

                        <button
                          onClick={() => deleteImage(item._id)}
                          className="gallery-delete-btn"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;
