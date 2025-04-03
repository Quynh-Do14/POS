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
import { suplierApi } from '../api/suplier'
import { toast } from 'react-toastify'

export const SupplierList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [supplierCode, setSupplierCode] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [percent, setPercent] = useState('')
  const [sdt, setSdt] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)

  const [dataSuplier, setDataSuplier] = useState([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [seachName, setSeachName] = useState('')

  const getData = async () => {
    const response = await suplierApi.getAll(page, 10, seachName)
    console.log(response.data.items)
    setDataSuplier(response.data.items)
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
      if (supplierCode && name && percent && address && sdt) {
        if (editingProduct) {
          await suplierApi.put(
            editingProduct.id,
            supplierCode,
            name,
            percent,
            address,
            sdt
          )
        }
        await suplierApi.create(supplierCode, name, percent, address, sdt)
      } else {
        toast.warn('Nhập đầy đủ các ô')
      }
    },
    onSuccess: () => {
      if (supplierCode && name && percent && address && sdt) {
        queryClient.invalidateQueries(['suplier'])
        resetForm()
        getData()
      }
    }
  })

  const handleEditProduct = product => {
    setEditingProduct(product)
    setName(product.name)
    setSupplierCode(product.supplierCode)
    setPercent(product.percent)
    setAddress(product.address)
    setSdt(product.sdt)
  }

  // Xử lý xóa sản phẩm
  const deleteMutation = useMutation({
    mutationFn: async id => await suplierApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['suplier'])
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
    setSupplierCode('')
    setName('')
    setPercent('')
    setAddress('')
    setSdt('')
  }

  // Render từng item trong danh sách
  const Row = ({ index, style }) => {
    const product = products[index]
    if (!product) return null

    return (
      <div
        style={{
          height: 100
        }}
        className='flex justify-between items-center p-3  last:border-none bg-white hover:bg-gray-50 transition'
      >
        <div className='flex flex-col gap-1'>
          <span className='text-gray-800 font-medium'>{product.name}</span>
          <span className='text-gray-800 font-medium'>{product.address}</span>
          <span className='text-gray-800 font-medium'>{product.sdt}</span>
        </div>
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
      className='container mx-auto p-6 rounded-xl shadow-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 my-8 border border-slate-200'
      onClick={e => e.stopPropagation()}
    >
      <div className='flex justify-between items-center pb-4 border-b border-slate-300 mb-5'>
        <h2 className='text-xl font-bold text-slate-800'>
          📦 Danh sách nhà cung cấp
        </h2>
        <button
          onClick={() => navigate('/')}
          className='bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 shadow-md transition font-medium'
        >
          Quay lại
        </button>
      </div>

      {/* Form nhập sản phẩm */}
      <div className='grid grid-cols-2 gap-6 mb-6'>
        {[
          {
            label: 'Mã nhà cung cấp',
            placeholder: 'Mã nhà cung cấp',
            value: supplierCode,
            set: setSupplierCode
          },
          {
            label: 'Tên nhà cung cấp',
            placeholder: 'Tên nhà cung cấp',
            value: name,
            set: setName
          },
          {
            label: 'Phần trăm',
            placeholder: 'Phần trăm',
            value: percent,
            set: val => setPercent(val < 100 && val),
            type: 'number'
          },
          {
            label: 'Địa chỉ',
            placeholder: 'Địa chỉ',
            value: address,
            set: setAddress
          },
          {
            label: 'SĐT',
            placeholder: 'Số điện thoại',
            value: sdt,
            set: setSdt
          }
        ].map(({ label, placeholder, value, set, type = 'text' }, i) => (
          <div key={i} className='flex flex-col'>
            <label className='text-sm font-semibold text-slate-700 mb-1'>
              {label}
            </label>
            <input
              type={type}
              className='h-10 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner placeholder:text-slate-400'
              placeholder={placeholder}
              value={value}
              onChange={e => set(e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Nút lưu */}
      <div className='flex items-center gap-3 mb-6'>
        <button
          onClick={() => saveMutation.mutate()}
          className='bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 shadow-md transition font-semibold'
        >
          {editingProduct ? 'Cập nhật' : 'Lưu'}
        </button>
        {editingProduct && (
          <button
            onClick={resetForm}
            className='bg-slate-400 text-white px-6 py-2 rounded-lg hover:bg-slate-500 shadow-md transition'
          >
            Hủy
          </button>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      <div className='w-full bg-white border border-slate-200 rounded-xl shadow-md px-4 py-5'>
        {/* Search */}
        <div className='mb-4'>
          <label className='text-sm font-semibold text-slate-600 mb-2 block'>
            🔍 Tìm kiếm Nhà cung cấp
          </label>
          <input
            type='text'
            className='w-full h-10 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-inner placeholder:text-slate-400'
            placeholder='Nhập Tên nhà cung cấp'
            value={seachName}
            onChange={onSearchName}
          />
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm text-left text-slate-700'>
            <thead className='bg-slate-100 text-xs font-semibold text-slate-500'>
              <tr>
                <th className='px-4 py-3'>Mã</th>
                <th className='px-4 py-3'>Tên</th>
                <th className='px-4 py-3'>Phần trăm</th>
                <th className='px-4 py-3'>Địa chỉ</th>
                <th className='px-4 py-3'>SĐT</th>
                <th className='px-4 py-3 text-right'>Thao tác</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200'>
              {dataSuplier.map((product, index) => (
                <tr
                  key={index}
                  className='hover:bg-slate-50 transition duration-150'
                  style={{ height: '64px' }}
                >
                  <td className='px-4 py-2 font-medium'>
                    {product.supplierCode}
                  </td>
                  <td className='px-4 py-2 font-medium'>{product.name}</td>
                  <td className='px-4 py-2 font-medium'>{product.percent}%</td>
                  <td className='px-4 py-2'>{product.address}</td>
                  <td className='px-4 py-2'>{product.sdt}</td>
                  <td className='px-4 py-2 text-right relative'>
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === product.id ? null : product.id)
                      }
                      className='p-2 rounded-full hover:bg-gray-200 transition'
                    >
                      <FaEllipsisV />
                    </button>
                    {openMenu === product.id && (
                      <div className='absolute right-0 top-9 w-40 bg-white rounded-xl shadow-xl z-20 ring-1 ring-slate-200'>
                        <ul className='divide-y divide-gray-200 text-sm'>
                          <li
                            className='px-4 py-2 hover:bg-gray-100 cursor-pointer text-emerald-600'
                            onClick={() => {
                              handleEditProduct(product)
                              setOpenMenu(null)
                            }}
                          >
                            ✏️ Sửa
                          </li>
                          <li
                            className='px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer'
                            onClick={() => {
                              deleteMutation.mutate(product.id)
                              setOpenMenu(null)
                            }}
                          >
                            🗑️ Xóa
                          </li>
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='flex justify-center items-center gap-4 mt-5 text-sm text-slate-600'>
          <button
            className='px-3 py-1 bg-slate-200 rounded hover:bg-slate-300 disabled:opacity-50'
            disabled={page === 0}
            onClick={() => setPage(prev => Math.max(prev - 1, 0))}
          >
            ⬅️ Trang trước
          </button>
          <span>
            Trang <strong>{page + 1}</strong> / {total}
          </span>
          <button
            className='px-3 py-1 bg-slate-200 rounded hover:bg-slate-300 disabled:opacity-50'
            disabled={page + 1 >= total}
            onClick={() => setPage(prev => prev + 1)}
          >
            Trang sau ➡️
          </button>
        </div>
      </div>
    </div>
  )
}
