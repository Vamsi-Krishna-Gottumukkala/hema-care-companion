import { useState } from "react";
import { Database, Upload, CheckCircle, FileText, Trash2 } from "lucide-react";

const datasets = [
  { id: "ds1", name: "CBC_BloodCancer_2024.csv", size: "4.2 MB", samples: 12450, uploaded: "2024-03-01", status: "Active" },
  { id: "ds2", name: "ALL_AML_Benchmark.csv", size: "2.8 MB", samples: 8200, uploaded: "2024-02-15", status: "Active" },
  { id: "ds3", name: "CLL_CML_Dataset_v2.csv", size: "1.9 MB", samples: 5600, uploaded: "2024-01-10", status: "Archived" },
];

const DatasetManagement = () => {
  const [items, setItems] = useState(datasets);
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center"><Database className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold font-display">Dataset Management</h1>
            <p className="text-sm text-muted-foreground">Manage AI training datasets</p>
          </div>
        </div>
        <button className="btn-primary gap-2"><Upload className="h-4 w-4" /> Upload Dataset</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[{ l: "Total Datasets", v: items.length.toString() }, { l: "Total Samples", v: "26,250" }, { l: "Model Accuracy", v: "94.6%" }].map((s) => (
          <div key={s.l} className="stat-card text-center">
            <p className="text-2xl font-bold font-display text-primary">{s.v}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {items.map((d) => (
          <div key={d.id} className="medical-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0"><FileText className="h-5 w-5 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.samples.toLocaleString()} samples · {d.size} · Uploaded {d.uploaded}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${d.status === "Active" ? "bg-success-light text-success" : "bg-muted text-muted-foreground"}`}>{d.status}</span>
            <button onClick={() => setItems(items.filter((i) => i.id !== d.id))} className="p-1.5 rounded-lg hover:bg-muted"><Trash2 className="h-4 w-4 text-danger" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DatasetManagement;
