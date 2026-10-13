const API_URL = (
  process.env.REACT_APP_API_URL || ""
).replace(/\/+$/, "");

export default function getImageUrl(path) {
  if (!path) return "";

  // External image URL
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Uploaded images served by the Render backend
  if (!API_URL) {
    console.error("REACT_APP_API_URL is not configured");
    return "";
  }

  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}