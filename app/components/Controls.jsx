import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { generateRulesJson } from "@/lib/validators";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function Controls({ clients, tasks, workers, rules, setRules }) {
  const [searchText, setSearchText] = useState("");
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [priorityLevelWeight, setPriorityLevelWeight] = useState(5);
  const [requestedTasksWeight, setRequestedTasksWeight] = useState(5);

  const handleSearch = () => {
    const lower = searchText.toLowerCase();
    const filtered = tasks.filter((t) => {
      const duration = Number(t.Duration);
      const phases = t.PreferredPhases;
      return (
        (lower.includes("duration") && duration > 1) ||
        (lower.includes("phase 2") && phases.includes("2"))
      );
    });
    setFilteredTasks(filtered);
  };

  const applyExampleRule = () => {
    setRules([...rules, { type: "coRun", tasks: ["T1", "T2"] }]);
  };

  const exportData = () => {
    const wb = XLSX.utils.book_new();
    const clientSheet = XLSX.utils.json_to_sheet(clients);
    const taskSheet = XLSX.utils.json_to_sheet(tasks);
    const workerSheet = XLSX.utils.json_to_sheet(workers);
    XLSX.utils.book_append_sheet(wb, clientSheet, "Clients");
    XLSX.utils.book_append_sheet(wb, taskSheet, "Tasks");
    XLSX.utils.book_append_sheet(wb, workerSheet, "Workers");
    XLSX.writeFile(wb, "cleaned_data.xlsx");

    const rulesBlob = new Blob(
      [
        generateRulesJson(rules, {
          priorityLevelWeight,
          requestedTasksWeight,
        }),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(rulesBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rules.json";
    link.click();
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl shadow-lg w-full max-w-xl">
      <h2 className="text-xl font-bold">Prioritization Weights</h2>
      <div>
        <label>Priority Level Weight: {priorityLevelWeight}</label>
        <Slider
          min={1}
          max={10}
          value={[priorityLevelWeight]}
          onValueChange={([v]) => setPriorityLevelWeight(v)}
        />
      </div>
      <div>
        <label>Requested Tasks Weight: {requestedTasksWeight}</label>
        <Slider
          min={1}
          max={10}
          value={[requestedTasksWeight]}
          onValueChange={([v]) => setRequestedTasksWeight(v)}
        />
      </div>

      <h2 className="text-xl font-bold mt-4">Natural Language Search</h2>
      <div className="flex gap-2">
        <Input
          placeholder="e.g., tasks with duration > 1 and phase 2"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {filteredTasks.length > 0 && (
        <p className="text-sm text-green-600">
          Showing {filteredTasks.length} matching tasks.
        </p>
      )}

      <h2 className="text-xl font-bold mt-4">Rule Input</h2>
      <Button onClick={applyExampleRule}>Add Example Co-Run Rule</Button>

      <div className="mt-4">
        <Button onClick={exportData} className="w-full">
          <Download className="mr-2" /> Export Cleaned Data + Rules
        </Button>
      </div>
    </div>
  );
}
