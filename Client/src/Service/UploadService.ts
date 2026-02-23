import axios from "axios";

export const UploadService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url;
  },
};
