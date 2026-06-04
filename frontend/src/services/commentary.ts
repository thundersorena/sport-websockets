import { apiClient } from "@/lib/api-client";
import { Commentary, CreateCommentaryInput, ApiResponse } from "@/types/api";

export const commentaryService = {
  
  async getCommentary(matchId: number, limit?: number): Promise<Commentary[]> {
    const endpoint = limit
      ? `/api/matches/${matchId}/commentary?limit=${limit}`
      : `/api/matches/${matchId}/commentary`;
    const response = await apiClient.get<ApiResponse<Commentary[]>>(endpoint);
    return response.data;
  },

  
  async createCommentary(
    matchId: number,
    data: CreateCommentaryInput
  ): Promise<Commentary> {
    const response = await apiClient.post<ApiResponse<Commentary>>(
      `/api/matches/${matchId}/commentary`,
      data
    );
    return response.data;
  },
};
