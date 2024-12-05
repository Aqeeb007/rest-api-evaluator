import axios from "axios";
import FormData from "form-data";
import SwaggerParser from "swagger-parser";

import { generateData } from "./data-generator.js";
import { processEndpointWithParams } from "./utils.js";

class Evaluator {
  constructor(specUrl) {
    this.specUrl = specUrl;
    this.spec = null;
    this.executionLog = {
      timestamp: new Date().toISOString(),
      specification: specUrl,
      endpoints: [],
    };
    this.summaryReport = {
      totalEndpoints: 0,
      successfulEndpoints: 0,
      failedEndpoints: 0,
      breakdownByMethod: {
        get: { total: 0, successful: 0, failed: 0 },
        post: { total: 0, successful: 0, failed: 0 },
      },
    };
  }

  async loadSpec() {
    try {
      //TODO
      this.spec = await SwaggerParser.parse(this.specUrl);
      // this.spec = data;
    } catch (error) {
      console.log("Error loading specification: ", error.message);
    }
  }

  async execute() {
    if (!this.spec) {
      await this.loadSpec();
    }

    const paths = this.spec.paths;

    for (const [path, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (["get", "post"].includes(method.toLowerCase())) {
          try {
            await this.executeEndpoint(path, method, operation);
          } catch (error) {
            console.log(`Execute :${path} ${method} ${error}`);
            throw error;
          }
        }
      }
    }
  }

  async executeEndpoint(path, method, operation) {
    const endpoint = `${this.spec.schemes[0]}://${this.spec.host}${this.spec.basePath}${path}`;

    // Summary report update
    const methodLower = method.toLowerCase();
    this.summaryReport.totalEndpoints++;
    this.summaryReport.breakdownByMethod[methodLower].total++;

    // Configure request
    const parameters = operation.parameters || [];
    const contentType =
      methodLower === "get" ? "application/json" : operation.consumes[0];

    const params = {};
    const query = {};
    let body = {};
    const formData = new FormData();

    for (const parameter of parameters) {
      try {
        switch (parameter.in) {
          case "path":
            params[parameter.name] = generateData(parameter);
            break;

          case "body":
            if (methodLower === "post") {
              const getSchemaOf =
                parameter.schema.type !== "array"
                  ? parameter.schema["$ref"].split("/").pop()
                  : parameter.schema.items["$ref"].split("/").pop();

              const schema = this.spec.definitions[getSchemaOf];

              if (schema && schema.properties) {
                if (parameter.schema.type === "array") {
                  // Generate an array of objects
                  body = Array.from({ length: 1 }, () => {
                    const obj = {};
                    Object.keys(schema.properties).forEach((key) => {
                      const propSchema = schema.properties[key];
                      obj[key] = propSchema.enum
                        ? propSchema.enum[0]
                        : generateData(propSchema);
                    });
                    return obj;
                  });
                } else {
                  // Generate a single object
                  Object.keys(schema.properties).forEach((key) => {
                    const propSchema = schema.properties[key];
                    body[key] = propSchema.enum
                      ? propSchema.enum[0]
                      : generateData(propSchema);
                  });
                }
              }
            }
            break;

          case "formData":
            if (methodLower === "post") {
              formData.append(parameter.name, generateData(parameter));
            }
            break;

          case "query":
            query[parameter.name] =
              parameter.items?.default || generateData(parameter);
            break;
        }
      } catch (error) {
        console.error(`Error processing parameter ${parameter.name}:`, error);
      }
    }

    const url = processEndpointWithParams(endpoint, params);
    const headers =
      contentType === "application/json"
        ? { "Content-Type": "application/json" }
        : formData.getHeaders();
    const data = contentType === "application/json" ? body : formData;

    // endpointLog
    const endpointLog = {
      endpoint: url,
      method: methodLower,
      requestDetails: {
        url,
        parameters: params,
        body: data,
        contentType,
      },
      response: null,
      status: null,
      success: false,
    };

    try {
      const response = await axios({
        method: methodLower,
        url,
        params: query ? query : undefined,
        data,
        headers,
      });

      // summary report update
      this.summaryReport.successfulEndpoints++;
      this.summaryReport.breakdownByMethod[methodLower].successful++;

      // Update endpoint log
      endpointLog.response = response.data;
      endpointLog.status = response.status;
      endpointLog.success = true;
    } catch (error) {
      // summary report update
      this.summaryReport.failedEndpoints++;
      this.summaryReport.breakdownByMethod[methodLower].failed++;

      // Update endpoint log
      endpointLog.response = error.response?.data || error.message;
      endpointLog.status = error.response?.status || "Error";
    }
    this.executionLog.endpoints.push(endpointLog);
  }
}

export default Evaluator;
