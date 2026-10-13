
const API_URL = (
  process.env.REACT_APP_API_URL || ""
).replace(/\/+$/, "");

export default function getImageUrl(path) {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!API_URL) {
    console.error("REACT_APP_API_URL is not configured");
    return "";
  }

  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}
