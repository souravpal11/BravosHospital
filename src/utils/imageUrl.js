
import api from "../config/api";

const imageUrl = (image) => {
  if (!image || typeof image !== "string") return "";

  if (/^(https?:|data:|blob:)/i.test(image)) {
    return image;
  }

  const cleanPath = image.replace(/^\/+/, "");

  return `${api.defaults.baseURL}/${cleanPath}`;
};

export default imageUrl;