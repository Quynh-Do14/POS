import { useState } from "react";

export const ExportModal = ({ columns, onExport, onClose }) => {
  const [selectedColumns, setSelectedColumns] = useState(columns);

  const handleChange = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-bold">Chọn Cột Xuất File</h2>
        <div className="mt-2">
          {columns.map((col) => (
            <label key={col} className="block">
              <input
                type="checkbox"
                checked={selectedColumns.includes(col)}
                onChange={() => handleChange(col)}
              />
              {col}
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onExport(selectedColumns)}
            className="bg-green-500 text-white p-2 rounded mr-2"
          >
            Xuất
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
