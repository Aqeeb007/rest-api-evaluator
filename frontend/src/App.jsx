import React, { useState, useCallback, useMemo } from "react";
import { Table } from "./components/table";

function App() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_API_URL}/evaluate-api`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ specUrl: url }),
          }
        );

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("API evaluation error:", error);
        alert("Evaluation failed");
      } finally {
        setIsLoading(false);
      }
    },
    [url]
  );

  const reportData = useMemo(() => {
    if (!data?.generateReports) return null;
    return {
      successPercent: data.generateReports.successPercent.toFixed(2),
      totalEndpoints: data.generateReports.totalEndpoints,
      successfulEndpoints: data.generateReports.successfulEndpoints,
      failedEndpoints: data.generateReports.failedEndpoints,
    };
  }, [data]);

  return (
    <div className="bg-neutral-100 min-h-screen w-full flex flex-col items-center">
      <header className="h-14 sticky top-0 bg-neutral-200 w-full flex items-center justify-between px-10">
        <h1 className="text-xl font-semibold text-neutral-800">
          REST API Evaluator
        </h1>
        <div className="flex items-center gap-4">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter OpenAPI Specification URL"
            className="h-10 px-2 ring-0 outline-none rounded-md w-96"
            type="text"
            disabled={isLoading}
          />
          <button
            disabled={isLoading}
            onClick={handleSubmit}
            className="h-10 px-4 bg-neutral-800 text-white rounded-md"
          >
            {isLoading ? "Evaluating..." : "Evaluate"}
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl animate-pulse">Evaluating...</div>
        </div>
      ) : (
        data && (
          <div className="w-[90%] mt-6">
            <div className="bg-indigo-100 w-full flex items-center justify-between p-6 rounded-md mb-4">
              <div>
                <h2 className="text-xl font-semibold text-emerald-500">
                  Success Rate: {reportData?.successPercent}%
                </h2>
                <p className="text-sm text-neutral-600 mt-1">
                  Input URL: {url}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-neutral-800">
                  Total Endpoints: {reportData?.totalEndpoints}
                </div>
                <div className="text-green-600">
                  Successful: {reportData?.successfulEndpoints}
                </div>
                <div className="text-red-600">
                  Failed: {reportData?.failedEndpoints}
                </div>
              </div>
            </div>
            <Table data={data.executionLog?.endpoints} />
          </div>
        )
      )}
    </div>
  );
}

export default React.memo(App);
