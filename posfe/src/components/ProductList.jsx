import { useState, useRef, useCallback } from "react";
import { FaEllipsisV } from "react-icons/fa";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { FixedSizeList as List } from "react-window";
import { useInView } from "react-intersection-observer";
import { productApi } from "../api/product";
import { MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export const ProductList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["products"],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await productApi.getAll(pageParam, 5);
        console.log(response.data.items);
        return response.data;
      },
      // getNextPageParam: (lastPage, pages) =>
      //   lastPage.last ? undefined : pages.length,
      getNextPageParam: (lastPage) => {
        const { page, size, total } = lastPage;
        const totalPages = Math.ceil(total / size);
        console.log(page);
        return page + 1 < totalPages ? page + 1 : undefined;
      },
    });

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
        );
      } else {
        await productApi.create(name, unitPrice, unit, salePrice);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      resetForm();
    },
  });

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setUnitPrice(product.unitPrice);
    setUnit(product.unit);
    setSalePrice(product.salePrice);
  };

  // Xử lý xóa sản phẩm
  const deleteMutation = useMutation({
    mutationFn: async (id) => await productApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  // Tự động tải thêm sản phẩm khi scroll xuống cuối
  const { ref, inView } = useInView({ threshold: 0.1 });
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setUnitPrice("");
    setUnit("");
    setSalePrice("");
  };

  // Render từng item trong danh sách
  const Row = ({ index, style }) => {
    const product = products[index];
    if (!product) return null;

    return (
      <div
        style={style}
        className="flex justify-between items-center p-3  last:border-none bg-white hover:bg-gray-50 transition"
      >
        <span className="text-gray-800 font-medium">
          {product.name} - ${product.salePrice}
        </span>
        <div className="relative">
          <button
            onClick={() =>
              setOpenMenu(openMenu === product.id ? null : product.id)
            }
            className="p-2 rounded-lg hover:bg-gray-200 transition"
          >
            <FaEllipsisV />
          </button>
          {openMenu === product.id && (
            <div className="absolute right-0 top-10 w-40 bg-white  rounded-lg shadow-2xl z-10">
              <ul className="divide-y divide-gray-200">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-green-600"
                  onClick={() => {
                    handleEditProduct(product);
                    setOpenMenu(!openMenu);
                  }}
                >
                  Edit
                </li>
                <li
                  className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
                  onClick={() => {
                    deleteMutation.mutate(product.id);
                    setOpenMenu(!openMenu);
                  }}
                >
                  Delete
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Tổng số sản phẩm đã tải
  // const products = data?.pages.flatMap((page) => page.items) || [];
  const products = data?.pages.flatMap((page) => page.items) || [];
  return (
    <div
      className="max-w-xl mx-auto p-5 rounded-lg shadow-2xl bg-white my-5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center pb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Danh sách hàng hoá
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Back
        </button>
      </div>

      {/* Form nhập sản phẩm */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1">
            Tên hàng hoá
          </label>
          <input
            type="text"
            className="w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
            placeholder="Tên hàng hoá"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1">
            Đơn giá
          </label>
          <input
            type="number"
            className="w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
            placeholder="Đơn giá"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1">
            Đơn vị tính
          </label>
          <input
            type="text"
            className="w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
            placeholder="DVT"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1">
            Giá bán
          </label>
          <input
            type="number"
            className="w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
            placeholder="Giá bán"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
        </div>
      </div>

      {/* Nút lưu */}
      <div className="flex items-center">
        <button
          onClick={() => saveMutation.mutate()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          {editingProduct ? "Update" : "Save"}
        </button>
        {editingProduct && (
          <button
            onClick={resetForm}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      <div className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow mt-3">
        <List
          height={300}
          itemCount={products.length}
          itemSize={50}
          width="100%"
        >
          {Row}
        </List>
        <div ref={ref} className="p-4 text-center text-gray-600">
          {isFetchingNextPage && "Loading more..."}
        </div>
      </div>
    </div>
  );
};
