"use client";
import { useState } from "react";
import Image from "next/image";
import InputButton from "./inputFile";
import DataTable from "./DataTable";
import { validateData } from "@/lib/validators";
import Controls from "../components/Controls";

export default function Hero() {
  const [clientsData, setClientsData] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [workersData, setWorkersData] = useState([]);
  const [validationSummary, setValidationSummary] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [rules, setRules] = useState([]);

  const handleDataParsed = (clients, tasks, workers) => {
    setClientsData(clients);
    setTasksData(tasks);
    setFilteredTasks(tasks);
    setWorkersData(workers);
    runValidation(clients, tasks, workers);
  };

  const runValidation = (clients, tasks, workers) => {
    const result = validateData(tasks, clients, workers);
    setValidationResult(result);

    const summary = [];
    if (result.invalidTasks.length)
      summary.push(
        `❌ ${result.invalidTasks.length} tasks have structural errors.`
      );
    if (result.invalidClients.length)
      summary.push(
        `❌ ${result.invalidClients.length} clients have structural errors.`
      );
    if (result.invalidWorkers.length)
      summary.push(
        `❌ ${result.invalidWorkers.length} workers have structural errors.`
      );
    if (result.uncoveredSkillsTasks.length)
      summary.push(
        `❌ ${result.uncoveredSkillsTasks.length} tasks have no qualified workers.`
      );
    if (result.saturatedPhases.length)
      summary.push(
        `⚠️ Phases ${result.saturatedPhases.join(", ")} are oversaturated.`
      );
    if (result.overloadedWorkers.length)
      summary.push(
        `⚠️ ${result.overloadedWorkers.length} workers are overloaded.`
      );
    if (!summary.length) summary.push("✅ All data looks valid.");

    setValidationSummary(summary);
  };

  return (
    <section className="min-h-screen px-6 md:px-16 py-12 bg-gray-300 flex flex-col items-center">
      <div className="flex flex-col md:flex-row items-center justify-around w-full gap-12">
        <div className="flex flex-col text-center justify-center md:text-left max-w-lg gap-6">
          <h1 className="text-4xl lg:text-6xl font-bold text-white drop-shadow">
            Data Alchemist
          </h1>
          <p className="text-lg md:text-xl text-white">
            Upload, validate, and export your CSV/XLSX files with ease.
          </p>
          <InputButton onDataParsed={handleDataParsed} />
        </div>

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

      {validationSummary.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-lg max-w-xl text-left space-y-2">
          {validationSummary.map((msg, idx) => (
            <p
              key={idx}
              className={
                msg.startsWith("✅") ? "text-green-600" : "text-red-600"
              }
            >
              {msg}
            </p>
          ))}
        </div>
      )}

      {clientsData.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-6">Clients</h2>
          <DataTable
            data={clientsData}
            setData={setClientsData}
            idField="ClientID"
            invalidRowIDs={
              validationResult?.invalidClients.map((c) => c.ClientID) || []
            }
            onDataChange={(updated) =>
              runValidation(updated, tasksData, workersData)
            }
          />
        </>
      )}

      {tasksData.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-6">Tasks</h2>
          <DataTable
            data={filteredTasks}
            setData={setTasksData}
            idField="TaskID"
            invalidRowIDs={
              validationResult?.invalidTasks.map((t) => t.TaskID) || []
            }
            onDataChange={(updated) => {
              setTasksData(updated);
              setFilteredTasks(updated);
              runValidation(clientsData, updated, workersData);
            }}
          />
        </>
      )}

      {workersData.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-6">Workers</h2>
          <DataTable
            data={workersData}
            setData={setWorkersData}
            idField="WorkerID"
            invalidRowIDs={
              validationResult?.invalidWorkers.map((w) => w.WorkerID) || []
            }
            onDataChange={(updated) =>
              runValidation(clientsData, tasksData, updated)
            }
          />
        </>
      )}

      {rules.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded shadow max-w-xl w-full">
          <h3 className="font-bold mb-2">Rules Config:</h3>
          <ul className="list-disc list-inside">
            {rules.map((rule, idx) => (
              <li key={idx}>
                {typeof rule === "string" ? rule : JSON.stringify(rule)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Controls
        clients={clientsData}
        tasks={tasksData}
        workers={workersData}
        rules={rules}
        setRules={setRules}
        setFilteredTasks={setFilteredTasks}
      />
    </section>
  );
}
