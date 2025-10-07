import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface SimulationInputs {
  scenario_name: string;
  monthly_invoice_volume: number;
  num_ap_staff: number;
  avg_hours_per_invoice: number;
  hourly_wage: number;
  error_rate_manual: number;
  error_cost: number;
  time_horizon_months: number;
  one_time_implementation_cost: number;
}

interface SimulationResults {
  monthly_savings: number;
  payback_months: number;
  roi_percentage: number;
  cumulative_savings: number;
  net_savings: number;
  labor_cost_manual: number;
  auto_cost: number;
  error_savings: number;
}

function App() {
  const [inputs, setInputs] = useState<SimulationInputs>({
    scenario_name: "Default Scenario",
    monthly_invoice_volume: 1000,
    num_ap_staff: 2,
    avg_hours_per_invoice: 0.25,
    hourly_wage: 25,
    error_rate_manual: 1.5,
    error_cost: 50,
    time_horizon_months: 12,
    one_time_implementation_cost: 5000,
  });

  const [results, setResults] = useState<SimulationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setInputs((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === "" // empty string → undefined field for now
            ? 0
            : parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/netlify/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to simulate");

      setResults(data.results);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-blue-700">
            ROI Calculator
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {Object.entries(inputs).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <Label className="capitalize mb-1">
                  {key.replace(/_/g, " ")}
                </Label>
                <Input
                  type={typeof value === "string" ? "text" : "number"}
                  name={key}
                  value={
                    value === undefined || value === null
                      ? ""
                      : value.toString()
                  }
                  step="any"
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="col-span-2 mt-4 flex justify-center">
              <Button type="submit" disabled={loading}>
                {loading ? "Calculating..." : "Simulate ROI"}
              </Button>
            </div>
          </form>

          {error && (
            <p className="text-red-600 text-center mt-4">{error}</p>
          )}

          {results && (
            <div className="mt-6 border-t pt-4">
              <h2 className="text-xl font-semibold text-center text-green-700 mb-4">
                Simulation Results
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(results).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-100 rounded-lg p-3 text-center"
                  >
                    <p className="text-sm text-gray-500 capitalize">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {typeof value === "number"
                        ? value.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })
                        : value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
