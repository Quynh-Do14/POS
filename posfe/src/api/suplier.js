import http from './http'

const URL = 'suplier'

export const suplierApi = {
  getAll (page, size, seachName) {
    return http.get(`${URL}?page=${page}&size=${size}&search=${seachName}`)
  },
  create (supplierCode, name, percent, address, sdt) {
    return http.post(`${URL}`, {
      supplierCode: supplierCode,
      name: name,
      percent: percent,
      address: address,
      sdt: sdt
    })
  },
  put (id, supplierCode, name, percent, address, sdt) {
    return http.put(`${URL}/${id}`, {
      supplierCode: supplierCode,
      name: name,
      percent: percent,
      address: address,
      sdt: sdt
    })
  },
  delete (id) {
    return http.delete(`${URL}/${id}`)
  }
}
