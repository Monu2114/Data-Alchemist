"use client";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

export default function DataTable({ data, setData }) {
  const columnHelper = createColumnHelper();

  const columns = data[0]
    ? Object.keys(data[0]).map((key) =>
        columnHelper.accessor(key, {
          header: key,
          cell: ({ getValue, row, column }) => {
            const initialValue = getValue();

            const handleChange = (e) => {
              const updatedData = [...data];
              updatedData[row.index][column.id] = e.target.value;
              setData(updatedData);
            };

            return (
              <input
                value={initialValue}
                onChange={handleChange}
                className="border px-1 py-0.5 rounded w-full"
              />
            );
          },
        })
      )
    : [];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) return null;

  return (
    <div className="overflow-auto max-w-full mt-4">
      <table className="min-w-full border border-gray-400">
        <thead className="bg-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border px-2 py-1 text-left">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border px-2 py-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
