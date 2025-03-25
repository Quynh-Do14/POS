import { useState, useRef, useCallback } from 'react'
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

export const SupplierList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [sdt, setSdt] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['suplier'],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await suplierApi.getAll(pageParam, 100)
        console.log(response.data.items)
        return response.data
      },
      // getNextPageParam: (lastPage, pages) =>
      //   lastPage.last ? undefined : pages.length,
      getNextPageParam: lastPage => {
        const { page, size, total } = lastPage
        const totalPages = Math.ceil(total / size)
        console.log(page)
        return page + 1 < totalPages ? page + 1 : undefined
      }
    })

  // Xử lý lưu/cập nhật sản phẩm
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingProduct) {
        await suplierApi.put(editingProduct.id, name, address, sdt)
      } else {
        await suplierApi.create(name, address, sdt)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['suplier'])
      resetForm()
    }
  })

  const handleEditProduct = product => {
    setEditingProduct(product)
    setName(product.name)
    setAddress(product.address)
    setSdt(product.sdt)
  }

  // Xử lý xóa sản phẩm
  const deleteMutation = useMutation({
    mutationFn: async id => await suplierApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['suplier'])
  })

  // Tự động tải thêm sản phẩm khi scroll xuống cuối
  const { ref, inView } = useInView({ threshold: 0.1 })
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage()
  }

  const resetForm = () => {
    setEditingProduct(null)
    setName('')
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
  const products = data?.pages.flatMap(page => page.items) || []
  return (
    <div
      className='max-w-xl mx-auto p-5 rounded-lg shadow-2xl bg-white my-5'
      onClick={e => e.stopPropagation()}
    >
      <div className='flex justify-between items-center pb-2'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Danh sách nhà cung cấp
        </h2>
        <button
          onClick={() => navigate('/')}
          className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition'
        >
          Back
        </button>
      </div>

      {/* Form nhập sản phẩm */}
      <div className='grid grid-cols-2 gap-3 mb-4'>
        <div className='flex flex-col'>
          <label className='text-sm font-medium text-slate-600 mb-1'>
            Tên nhà cung cấp
          </label>
          <input
            type='text'
            className='w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md'
            placeholder='Tên nhà cung cấp'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className='flex flex-col'>
          <label className='text-sm font-medium text-slate-600 mb-1'>
            Địa chỉ
          </label>
          <input
            type='text'
            className='w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md'
            placeholder='Địa chỉ'
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>

        <div className='flex flex-col'>
          <label className='text-sm font-medium text-slate-600 mb-1'>SĐT</label>
          <input
            type='text'
            className='w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md'
            placeholder='SĐT'
            value={sdt}
            onChange={e => setSdt(e.target.value)}
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
      <div className='w-full bg-transparent overflow-auto placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow mt-3'>
        {products.map((product, index) => {
          return (
            <div
              style={{
                height: 100
              }}
              key={index}
              className='flex justify-between items-center p-3  last:border-none bg-white hover:bg-gray-50 transition'
            >
              <div className='flex flex-col gap-1'>
                <span className='text-gray-800 font-medium'>
                  Tên: {product.name}
                </span>
                <span className='text-gray-800 font-medium'>
                  ĐC: {product.address}
                </span>
                <span className='text-gray-800 font-medium'>
                  SĐT: {product.sdt}
                </span>
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
        })}
        <div ref={ref} className='p-4 text-center text-gray-600'>
          {isFetchingNextPage && 'Loading more...'}
        </div>
      </div>
    </div>
  )
}
