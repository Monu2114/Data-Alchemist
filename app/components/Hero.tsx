import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Hero() {
  return (
    <section className="min-h-screen px-6 md:px-16 py-12 bg-gray-300 flex items-center">
      <div className="flex flex-col md:flex-row items-center justify-around w-full gap-12">
        {/* Text Section */}
        <div className="flex flex-col text-center justify-center md:text-left max-w-lg gap-6">
          <h1 className="text-4xl lg:text-6xl font-bold text-white drop-shadow">
            Data Alchemist
          </h1>
          <p className="text-lg md:text-xl text-white whitespace-nowrap">
            Upload, validate, and export your CSV or XLSX files with ease.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Button
              variant="secondary"
              className="w-32 hover:scale-105 transition"
            >
              Clients <Download />
            </Button>
            <Button
              variant="secondary"
              className="w-32 hover:scale-105 transition"
            >
              Tasks <Download />
            </Button>
            <Button
              variant="secondary"
              className="w-32 hover:scale-105 transition"
            >
              Workers <Download />
            </Button>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex justify-center rotate-2">
          <Image
            src="/alchemist.jpeg"
            alt="Alchemist"
            className="rounded-xl shadow-xl"
            width={400}
            height={400}
          />
        </div>
      </div>
    </section>
  );
}
