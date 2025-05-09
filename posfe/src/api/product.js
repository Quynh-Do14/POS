import http from './http'

const URL = 'product'

export const productApi = {
  getAll (page, size, seachName) {
    return http.get(`${URL}?page=${page}&size=${size}&search=${seachName}`)
  },
  create (name, unitPrice, unit, salePrice) {
    return http
      .post(`${URL}`, {
        name: name,
        unitPrice: unitPrice,
        unit: unit,
        salePrice: salePrice
      })
      .then(() => {})
      .catch(err => {
        console.error(err)
        toast.error(err.response.data.message || '')
      })
  },
  put (id, name, unitPrice, unit, salePrice) {
    return http
      .put(`${URL}/${id}`, {
        name: name,
        unitPrice: unitPrice,
        unit: unit,
        salePrice: salePrice
      })
      .then(() => {})
      .catch(err => {
        console.error(err)
        toast.error(err.response.data.message || '')
      })
  },
  delete (id) {
    return http
      .delete(`${URL}/${id}`)
      .then(() => {})
      .catch(err => {
        console.error(err)
        toast.error(err.response.data.message || '')
      })
  }
}
