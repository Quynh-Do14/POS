import { useState, useRef, useCallback, useEffect } from 'react'
import { FaEllipsisV } from 'react-icons/fa'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import { FixedSizeList as List } from 'react-window'
import { useInView } from 'react-intersection-observer'
import { productApi } from '../api/product'
import { MdClose } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

export const ProductList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [unit, setUnit] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)

  const [dataProduct, setDataProduct] = useState([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [seachName, setSeachName] = useState('')

  const getData = async () => {
    const response = await productApi.getAll(page, 10, seachName)
    setDataProduct(response.data.items)
    setTotal(response.data.total)
  }
  useEffect(() => {
    getData()
  }, [page, total, seachName])

  const onSearchName = e => {
    setSeachName(e.target.value)
    setPage(0)
  }

  // Xử lý lưu/cập nhật sản phẩm
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingProduct) {
        await productApi.put(
          editingProduct.id,
          name,
          unitPrice,
          unit,
          salePrice
        )
      } else {
        await productApi.create(name, unitPrice, unit, salePrice)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      resetForm()
      getData()
    }
  })

  const handleEditProduct = product => {
    setEditingProduct(product)
    setName(product.name)
    setUnitPrice(product.unitPrice)
    setUnit(product.unit)
    setSalePrice(product.salePrice)
  }

  // Xử lý xóa sản phẩm
  const deleteMutation = useMutation({
    mutationFn: async id => await productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      getData()
    }
  })

  // Tự động tải thêm sản phẩm khi scroll xuống cuối
  const { ref, inView } = useInView({ threshold: 0.1 })
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage()
  }

  const resetForm = () => {
    setEditingProduct(null)
    setName('')
    setUnitPrice('')
    setUnit('')
    setSalePrice('')
  }

  // Render từng item trong danh sách
  const Row = ({ index, style }) => {
    const product = products[index]
    if (!product) return null

    return (
      <div
        style={style}
        className='flex justify-between items-center p-3  last:border-none bg-white hover:bg-gray-50 transition'
      >
        <span className='text-gray-800 font-medium'>
          {product.name} - ${product.salePrice}
        </span>
        <div className='relative'>
          <button
            onClick={() =>
              setOpenMenu(openMenu === product.id ? null : product.id)
            }
            className='p-2 rounded-lg hover:bg-gray-200 transition'
          >
            <FaEllipsisV />
          </button>
          {openMenu === product.id && (
            <div className='absolute right-0 top-10 w-40 bg-white  rounded-lg shadow-2xl z-10'>
              <ul className='divide-y divide-gray-200'>
                <li
                  className='px-4 py-2 hover:bg-gray-100 cursor-pointer text-green-600'
                  onClick={() => {
                    handleEditProduct(product)
                    setOpenMenu(!openMenu)
                  }}
                >
                  Edit
                </li>
                <li
                  className='px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer'
                  onClick={() => {
                    deleteMutation.mutate(product.id)
                    setOpenMenu(!openMenu)
                  }}
                >
                  Delete
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Tổng số sản phẩm đã tải
  // const products = data?.pages.flatMap((page) => page.items) || [];
  // const products = data?.pages.flatMap(page => page.items) || []

  return (
    <div
      className='container mx-auto p-5 rounded-lg shadow-2xl bg-white my-5'
      onClick={e => e.stopPropagation()}
    >
      <div className='flex justify-between items-center pb-2'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Danh sách hàng hoá
        </h2>
        <button
          onClick={() => navigate('/')}
          className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition'
        >
          Back
        </button>
      </div>

      {/* Form nhập sản phẩm */}
      <div className='grid grid-cols-1 gap-3 mb-4'>
        <div className='flex flex-col'>
          <label className='text-sm font-medium text-slate-600 mb-1'>
            Tên hàng hoá
          </label>
          <input
            type='text'
            className='w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md'
            placeholder='Tên hàng hoá'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
      </div>

      {/* Nút lưu */}
      <div className='flex items-center'>
        <button
          onClick={() => saveMutation.mutate()}
          className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition'
        >
          {editingProduct ? 'Update' : 'Save'}
        </button>
        {editingProduct && (
          <button
            onClick={resetForm}
            className='ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition'
          >
            Cancel
          </button>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      <div className='w-full bg-white overflow-auto border border-slate-200 rounded-md shadow-sm mt-3 py-4 px-1'>
        <div className='flex flex-col mb-2'>
          <label className='text-sm font-medium text-slate-600 mb-1'>
            Tìm kiếm hàng
          </label>
          <input
            type='text'
            className='w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md'
            placeholder='Nhập tên hàng'
            value={seachName}
            onChange={onSearchName}
          />
        </div>

        <table className='min-w-full text-sm text-left text-slate-700'>
          <thead className='bg-slate-100 text-xs uppercase text-slate-500'>
            <tr>
              <th className='px-4 py-3'>Tên</th>
              <th className='px-4 py-3 text-right'>Thao tác</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-200'>
            {dataProduct.map((product, index) => (
              <tr
                key={index}
                className='hover:bg-slate-50 transition duration-150'
                style={{ height: '64px' }}
              >
                <td className='px-4 py-2 font-medium text-slate-800'>
                  {product.name}
                </td>

                <td className='px-4 py-2 text-right relative'>
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === product.id ? null : product.id)
                    }
                    className='p-2 rounded-lg hover:bg-gray-200 transition'
                  >
                    <FaEllipsisV />
                  </button>
                  {openMenu === product.id && (
                    <div className='absolute right-0 top-9 w-40 bg-white rounded-lg shadow-2xl z-10'>
                      <ul className='divide-y divide-gray-200'>
                        <li
                          className='px-4 py-2 hover:bg-gray-100 cursor-pointer text-green-600'
                          onClick={() => {
                            handleEditProduct(product)
                            setOpenMenu(null)
                          }}
                        >
                          Edit
                        </li>
                        <li
                          className='px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer'
                          onClick={() => {
                            deleteMutation.mutate(product.id)
                            setOpenMenu(null)
                          }}
                        >
                          Delete
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='flex justify-center gap-2 p-4 text-sm text-gray-600'>
          <button
            className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
            disabled={page === 0}
            onClick={() => setPage(prev => Math.max(prev - 1, 0))}
          >
            Trang trước
          </button>
          <span className='px-2'>
            Trang {page + 1} / {total}
          </span>
          <button
            className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
            disabled={page + 1 >= total}
            onClick={() => setPage(prev => prev + 1)}
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  )
}
