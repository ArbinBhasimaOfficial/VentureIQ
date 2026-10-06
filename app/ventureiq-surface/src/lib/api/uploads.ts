import apiClient from "./client";

export type UploadedFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  reportId: string | null;
  createdAt: string;
};

export async function getFilesForReport(reportId: string): Promise<UploadedFile[]> {
  const response = await apiClient.get<{ status: string; data: UploadedFile[] }>(
    `/v1/uploads/report/${reportId}`,
  );
  return response.data.data;
}

export async function uploadFile(file: File, reportId?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (reportId) formData.append("reportId", reportId);

  const response = await apiClient.post<{ status: string; data: UploadedFile }>(
    "/v1/uploads",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.data;
}

export async function deleteUpload(id: string) {
  await apiClient.delete(`/v1/uploads/${id}`);
}
