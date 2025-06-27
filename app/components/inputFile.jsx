"use client";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function InputButton({ onDataParsed }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetNames = workbook.SheetNames;
      const findSheet = (keyword) =>
        sheetNames.find((name) =>
          name.toLowerCase().includes(keyword.toLowerCase())
        );

      const clientsSheet = findSheet("Clients");
      const tasksSheet = findSheet("Tasks");
      const workersSheet = findSheet("Worker");

      if (clientsSheet && tasksSheet && workersSheet) {
        const clientsData = XLSX.utils.sheet_to_json(
          workbook.Sheets[clientsSheet]
        );
        const tasksData = XLSX.utils.sheet_to_json(workbook.Sheets[tasksSheet]);
        const workersData = XLSX.utils.sheet_to_json(
          workbook.Sheets[workersSheet]
        );

        onDataParsed(clientsData, tasksData, workersData);
      } else {
        console.error("One or more required sheets not found");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <label className="px-2 py-2  text-white rounded cursor-pointer hover:bg-blue-700 transition inline-flex items-center gap-2 w-32 justify-center">
      Upload File <Download size={16} />
      <input
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  );
}
