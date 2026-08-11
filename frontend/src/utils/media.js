export function optimizeCloudinaryImage(url, options = {}) {
  if (!url || !String(url).includes("/upload/")) {
    return url;
  }

  const transforms = [
    "f_auto",
    "q_auto",
    options.width ? `w_${options.width}` : "",
    options.height ? `h_${options.height}` : "",
    options.crop ? `c_${options.crop}` : "",
  ]
    .filter(Boolean)
    .join(",");

  if (!transforms) {
    return url;
  }

  if (String(url).includes(`/upload/${transforms}`) || String(url).includes("/upload/f_auto")) {
    return url;
  }

  return String(url).replace("/upload/", `/upload/${transforms}/`);
}
