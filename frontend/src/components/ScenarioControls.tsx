import { useState } from "react";
import { useScenario } from "../ScenarioContext";
import type { FormState } from "../types";

interface SavedScenario {
  name: string;
  data: FormState;
}

function getScenarios(): SavedScenario[] {
  const raw = localStorage.getItem("scenarios");
  return raw ? (JSON.parse(raw) as SavedScenario[]) : [];
}

function saveScenarios(list: SavedScenario[]) {
  localStorage.setItem("scenarios", JSON.stringify(list));
}

export default function ScenarioControls() {
  const { form, setForm } = useScenario();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const scenarios = getScenarios();

  const handleSave = () => {
    if (!name) return;
    const updated = scenarios.filter((s) => s.name !== name);
    updated.push({ name, data: form });
    saveScenarios(updated);
    setName("");
    setShowModal(false);
  };

  const handleLoad = (n: string) => {
    const found = scenarios.find((s) => s.name === n);
    if (found) setForm(found.data);
  };

  return (
    <div className="flex items-center gap-2">
      <button className="btn" onClick={() => setShowModal(true)}>
        Save
      </button>
      <select
        className="btn"
        onChange={(e) => handleLoad(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          {scenarios.length ? "Load" : "No Scenarios Saved"}
        </option>
        {scenarios.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
      <button className="btn" onClick={() => window.print()}>
        Export
      </button>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal space-y-2">
            <input
              className="w-full"
              placeholder="Scenario Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
