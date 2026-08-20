import { apiRequest } from "./base.js";
import { config } from "/shared/utils/config.js";

export function validateImageFile(file) {
  if (!file) return { valid: false, error: "파일을 선택해주세요." };
  if (!config.IMAGE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)" };
  }
  if (file.size > config.IMAGE_UPLOAD.MAX_SIZE) {
    return { valid: false, error: "파일 크기가 너무 큽니다. (최대 5MB)" };
  }
  return { valid: true, error: null };
}

async function upload(endpoint, formData) {
  return apiRequest(endpoint, { method: "POST", body: formData });
}

export const ImagesAPI = {
  async uploadProfileImage(file) {
    const validation = validateImageFile(file);
    if (!validation.valid) return { imageId: null, error: validation.error };

    const formData = new FormData();
    formData.append("file", file);
    const response = await upload("/images/profile", formData);
    if (response.error || !response.data) {
      return { imageId: null, error: response.error?.message || "이미지 업로드에 실패했습니다." };
    }
    return { imageId: response.data.imageId, url: response.data.url, error: null };
  },

  async uploadMultiplePostImages(files) {
    const validFiles = [];
    const errors = [];
    for (const file of files) {
      const validation = validateImageFile(file);
      if (validation.valid) validFiles.push(file);
      else errors.push({ file: file.name, error: validation.error });
    }
    if (validFiles.length === 0) return { imageIds: [], images: [], errors };

    const formData = new FormData();
    validFiles.forEach(file => formData.append("files", file));
    const response = await upload("/images/posts", formData);
    if (response.error || !response.data) {
      return {
        imageIds: [],
        images: [],
        errors: [...errors, ...validFiles.map(file => ({ file: file.name, error: response.error?.message || "이미지 업로드에 실패했습니다." }))]
      };
    }
    return {
      imageIds: response.data.map(image => image.imageId),
      images: response.data,
      errors
    };
  }
};
