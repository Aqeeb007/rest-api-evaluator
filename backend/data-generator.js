import fs from "fs";
import { faker } from "@faker-js/faker";

export function generateData(schema) {
  if (!schema) {
    return null;
  }

  switch (schema.type) {
    case "string":
      if (schema?.format === "date-time") {
        return faker.date.recent().toISOString();
      }
      return faker.lorem.words();

    case "number":
    case "integer":
      return faker.number.int({
        min: schema.minimum || 0,
        max: schema.maximum || 10000,
      });

    case "file":
      return fs.createReadStream("./file.jpeg");

    case "boolean":
      return faker.datatype.boolean();

    case "array":
      const arrayLength = 1;
      return Array.from({ length: arrayLength }, () =>
        generateData(schema.items)
      );

    case "object":
      if (schema.properties) {
        return Object.fromEntries(
          Object.entries(schema.properties).map(([key, propSchema]) => [
            key,
            generateData(propSchema),
          ])
        );
      }
      return {};

    default:
      return null;
  }
}
