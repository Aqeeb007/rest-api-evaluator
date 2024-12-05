import "dotenv/config";
import express from "express";
import cors from "cors";

import Evaluator from "./evaluator.js";

const app = express();
app.use(
  cors({
    origin: true,
  })
);
app.use(express.json());

app.post("/api/evaluate-api", async (req, res) => {
  const { specUrl } = req.body;
  const evaluator = new Evaluator(specUrl);

  try {
    await evaluator.execute();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  const generateReports = evaluator.summaryReport;
  const executionLog = evaluator.executionLog;

  const successPercent =
    (generateReports.successfulEndpoints / generateReports.totalEndpoints) *
    100;

  generateReports.successPercent = successPercent;

  return res.status(200).json({ generateReports, executionLog });
});

const port = process.env.PORT || 8081;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
