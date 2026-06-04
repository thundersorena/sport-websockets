import { apiClient } from "@/lib/api-client";
import {
  Match,
  CreateMatchInput,
  UpdateScoreInput,
  ApiResponse,
} from "@/types/api";

export const matchesService = {
 
  async getMatches(limit?: number): Promise<Match[]> {
    const endpoint = limit ? `/api/matches?limit=${limit}` : "/api/matches";
    const response = await apiClient.get<ApiResponse<Match[]>>(endpoint);
    return response.data;
  },

  
  async getMatch(id: number): Promise<Match> {
    const response = await apiClient.get<ApiResponse<Match>>(
      `/api/matches/${id}`
    );
    return response.data;
  },

  
  async createMatch(data: CreateMatchInput): Promise<Match> {
    const response = await apiClient.post<ApiResponse<Match>>(
      "/api/matches",
      data
    );
    return response.data;
  },

 
  async updateScore(id: number, data: UpdateScoreInput): Promise<Match> {
    const response = await apiClient.patch<ApiResponse<Match>>(
      `/api/matches/${id}/score`,
      data
    );
    return response.data;
  },
};
