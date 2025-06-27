"use client";
import { Download } from "lucide-react";
export default function InputButton({ type }) {
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log(`Selected ${type} file:`, file.name);
    // You can trigger parsing logic here
  };
  return (
    <label className="px-4 py-2 text-white rounded cursor-pointer hover:bg-blue-700 transition inline-flex items-center gap-2 w-32 justify-center">
      {type} <Download size={16} />
      <input
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={(e) => handleFileChange(e, "Clients")}
      />
    </label>
  );
}
