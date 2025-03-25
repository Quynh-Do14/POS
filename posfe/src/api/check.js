import http from "./http";

const URL_CHECK_UPLOAD_FILE = "excel/upload";

export const checkApi = {
  checkFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    return http.post(URL_CHECK_UPLOAD_FILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
