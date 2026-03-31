import { useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import Dashboard from "./components/Dashboard";
import PatientDetail from "./components/PatientDetail";
import type { Patient } from "./types";

export default function App() {
  const { patients, alerts, connected, getHistory } = useWebSocket();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return (
    <div className="min-h-screen bg-slate-950">
      <Dashboard
        patients={patients}
        alerts={alerts}
        connected={connected}
        onSelectPatient={setSelectedPatient}
      />
      {selectedPatient && (
        <PatientDetail
          patient={selectedPatient}
          history={getHistory(selectedPatient.bed)}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}
