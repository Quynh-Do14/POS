import http from './http'

const URL = 'unit'

export const unitApi = {
  getAll (page, size, seachName) {
    return http.get(`${URL}?page=${page}&size=${size}&search=${seachName}`)
  },
  create (name) {
    return http.post(`${URL}`, {
      name: name
    })
  },
  put (id, name) {
    return http.put(`${URL}/${id}`, {
      name: name
    })
  },
  delete (id) {
    return http.delete(`${URL}/${id}`)
  }
}
