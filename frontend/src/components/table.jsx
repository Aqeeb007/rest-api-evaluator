/* eslint-disable react/prop-types */
import { useMemo } from "react";

export const Table = ({ data = [] }) => {
  const tableRows = useMemo(
    () =>
      data.map((item) => (
        <tr
          key={item.id}
          className="hover:bg-neutral-100 transition-colors duration-200"
        >
          <td className="px-6 py-4 border-x dark:border-neutral-600">
            <span
              className={`
            px-2 py-1 rounded 
            ${
              item.method === "get"
                ? "bg-green-100 text-green-800"
                : item.method === "post"
                ? "bg-blue-100 text-blue-800"
                : "bg-neutral-100"
            }
          `}
            >
              {item.method}
            </span>
          </td>
          <td className="px-6 py-4 border-x dark:border-neutral-600 max-w-xs truncate">
            {item.endpoint}
          </td>
          <td className="px-6 py-4 border-x dark:border-neutral-600">
            <span
              className={`
            px-2 py-1 rounded 
            ${
              item.status >= 200 && item.status < 300
                ? "bg-green-100 text-green-800"
                : item.status >= 400
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }
          `}
            >
              {item.status}
            </span>
          </td>
          <td className="px-6 py-4 border-x dark:border-neutral-600">
            <span
              className={`
            px-2 py-1 rounded 
            ${
              item.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }
          `}
            >
              {item.success ? "Success" : "Failed"}
            </span>
          </td>
          <td className="px-6 py-4 border-x dark:border-neutral-600 max-w-xs truncate">
            {JSON.stringify(item.response)}
          </td>
        </tr>
      )),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="text-center py-6 bg-white rounded-md">
        No endpoint data available
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto w-full bg-white rounded-md border-none outline-none"
      aria-label="API Endpoints Evaluation Table"
    >
      <table
        className="min-w-full text-left text-sm whitespace-nowrap"
        aria-describedby="endpoint-evaluation-table"
      >
        <thead className="uppercase tracking-wider bg-neutral-200">
          <tr>
            {[
              "Method",
              "Endpoint URL",
              "Status Code",
              "Success",
              "Response",
            ].map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-4 border-x dark:border-neutral-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
    </div>
  );
};

export default Table;
