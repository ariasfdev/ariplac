import { api } from "./api";



export const getModelos = async () => {
    const response = await api.get("/modelos/");
    console.log(response.data);
    return response.data;
};

export const getPrecioByIdModelo = async (idModelo: string) => {
    const response = await api.get(`/stock/precios/${idModelo}`);
    console.log(response.data);
    return response.data;
};

