import axios from "axios";
import { API_BASE_URL } from "../config";



export const getModelos = async () => {
    const response = await axios.get(`${API_BASE_URL}/modelos/`);
    console.log(response.data);
    return response.data;
};

export const getPrecioByIdModelo = async (idModelo: string) => {
    const response = await axios.get(`${API_BASE_URL}/stock/precios/${idModelo}`);
    console.log(response.data);
    return response.data;
};

