import { api } from "./api";



export const getModelos = async () => {
    const response = await api.get("/modelos/");
    return response.data;
};

export const getPrecioByIdModelo = async (idModelo: string) => {
    // Validar que idModelo no esté vacío
    if (!idModelo || !idModelo.trim()) {
        console.warn("getPrecioByIdModelo: idModelo está vacío, retornando array vacío");
        return [];
    }
    const response = await api.get(`/stock/precios/${idModelo.trim()}`);
    return response.data;
};

