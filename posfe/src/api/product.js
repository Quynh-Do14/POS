import http from "./http";

const URL = "product";

export const productApi = {
  getAll(page, size) {
    return http.get(`${URL}?page=${page}&size=${size}`);
  },
  create(name, unitPrice, unit, salePrice) {
    return http.post(`${URL}`, {
      name: name,
      unitPrice: unitPrice,
      unit: unit,
      salePrice: salePrice,
    });
  },
  put(id, name, unitPrice, unit, salePrice) {
    return http.put(`${URL}/${id}`, {
      name: name,
      unitPrice: unitPrice,
      unit: unit,
      salePrice: salePrice,
    });
  },
  delete(id) {
    return http.delete(`${URL}/${id}`);
  },
};
