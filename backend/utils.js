export function processEndpointWithParams(endpoint, params) {
  const paramRegex = /\{([^}]+)\}/g;

  const matches = [...endpoint.matchAll(paramRegex)];

  if (matches.length === 0) {
    return endpoint;
  }

  // Replace each parameter
  let processedEndpoint = endpoint;
  for (const match of matches) {
    const fullMatch = match[0];
    const paramName = match[1];

    if (params && params[paramName] !== undefined) {
      processedEndpoint = processedEndpoint.replace(
        fullMatch,
        encodeURIComponent(params[paramName])
      );
    } else {
      console.log(`Missing required parameter: ${paramName}`);
    }
  }

  return processedEndpoint;
}
