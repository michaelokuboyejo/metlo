import axios from "axios"
import { ApiEndpoint, ApiEndpointDetailed } from "@common/types"
import { API_URL } from "../../constants"

export const getEndpoints = async () => {
  try {
    const resp = await axios.get<ApiEndpoint[]>(`${API_URL}/endpoints`);
    if (resp.status === 200 && resp.data) {
      return resp.data;
    }
    return [];
  } catch (err) {
    console.error(`Error fetching endpoints: ${err}`);
    return []
  }
}

export const getEndpoint = async (endpointId: string) => {
  try {
    const resp = await axios.get<ApiEndpointDetailed>(`${API_URL}/endpoint/${endpointId}`)
    if (resp.status === 200 && resp.data) {
      return resp.data;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching endpoint: ${err}`);
    return null
  }
}