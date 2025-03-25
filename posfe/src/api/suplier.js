import http from './http'

const URL = 'suplier'

export const suplierApi = {
  getAll (page, size) {
    return http.get(`${URL}?page=${page}&size=${size}`)
  },
  create (name, address, sdt) {
    console.log('name, address, sdt', name, address, sdt)

    return http.post(`${URL}`, {
      name: name,
      address: address,
      sdt: sdt
    })
  },
  put (id, name, address, sdt) {
    return http.put(`${URL}/${id}`, {
      name: name,
      address: address,
      sdt: sdt
    })
  },
  delete (id) {
    return http.delete(`${URL}/${id}`)
  }
}
