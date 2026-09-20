import React, { useEffect, useState } from "react";
import axios from "axios";


const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/gallery"
        );

        setImages(response.data.images || []);
      } catch (error) {
        console.error("Gallery Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  if (loading || images.length === 0) {
    return null;
  }

  return (
    <section className="home-gallery">

      <div className="container">

        {/* SECTION HEADER */}

        <div className="gallery-header">

          <span>BRAVOS HOSPITAL</span>

          <h2>
            Our <strong>Gallery</strong>
          </h2>

          <p>
            Explore Bravos Hospital, our modern facilities,
            caring environment and healthcare services.
          </p>

        </div>


        {/* SLIDESHOW */}

        <div
          id="bravosGallery"
          className="carousel slide gallery-carousel"
          data-bs-ride="carousel"
          data-bs-interval="5000"
          data-bs-pause="hover"
        >

          {/* INDICATORS */}

          <div className="carousel-indicators">

            {images.map((item, index) => (

              <button
                key={item._id}
                type="button"
                data-bs-target="#bravosGallery"
                data-bs-slide-to={index}
                className={index === 0 ? "active" : ""}
                aria-current={
                  index === 0 ? "true" : undefined
                }
                aria-label={`Slide ${index + 1}`}
              />

            ))}

          </div>


          {/* SLIDES */}

          <div className="carousel-inner">

            {images.map((item, index) => (

              <div
                key={item._id}
                className={`carousel-item ${
                  index === 0 ? "active" : ""
                }`}
              >

                <div className="gallery-slide">

                  <img
                    src={`http://localhost:5000${item.image}`}
                    alt={item.title}
                  />


                  {/* IMAGE INFORMATION */}

                  <div className="gallery-slide-overlay">

                    <div className="gallery-slide-content">

                      <span>
                        {item.category}
                      </span>

                      <h3>
                        {item.title}
                      </h3>

                      {item.description && (
                        <p>
                          {item.description}
                        </p>
                      )}

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>


          {/* PREVIOUS */}

          <button
            className="carousel-control-prev gallery-control"
            type="button"
            data-bs-target="#bravosGallery"
            data-bs-slide="prev"
          >

            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>

            <span className="visually-hidden">
              Previous
            </span>

          </button>


          {/* NEXT */}

          <button
            className="carousel-control-next gallery-control"
            type="button"
            data-bs-target="#bravosGallery"
            data-bs-slide="next"
          >

            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>

            <span className="visually-hidden">
              Next
            </span>

          </button>

        </div>

      </div>

    </section>
  );
};

export default Gallery;