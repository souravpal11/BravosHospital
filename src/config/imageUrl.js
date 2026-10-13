const API_URL = (
  process.env.REACT_APP_API_URL || ""
).replace(/\/+$/, "");

export default function getImageUrl(path) {
  if (!path) return "";

  // Keep complete external image URLs unchanged.
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Use the deployed backend for uploaded images.
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}