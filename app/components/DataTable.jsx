"use client";
import { useState } from "react";

export default function DataTable({
  data,
  setData,
  invalidRowIDs = [],
  idField,
}) {
  const [localData, setLocalData] = useState(data);

  const handleCellChange = (rowIndex, field, value) => {
    const updatedData = [...localData];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: value };
    setLocalData(updatedData);
    setData(updatedData); // Trigger parent update & validation
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="table-auto border border-gray-400 w-full text-sm">
        <thead>
          <tr className="bg-gray-200">
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key} className="p-2 border border-gray-400">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {localData.map((row, rowIndex) => (
            <tr
              key={row[idField] || rowIndex}
              className={
                invalidRowIDs.includes(row[idField]) ? "bg-red-200" : "bg-white"
              }
            >
              {Object.entries(row).map(([field, value]) => (
                <td key={field} className="p-1 border border-gray-300">
                  <input
                    className="w-full p-1 border border-gray-300 rounded"
                    value={value}
                    onChange={(e) =>
                      handleCellChange(rowIndex, field, e.target.value)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
