function parseErrorShorthand(error: Error) {
  console.log("------- FULL ERROR START -------");
  console.log(error);
  console.log("------- FULL ERROR END -------");

  console.log("\n\n------ ERROR SHORTHAND ------");
  console.error(`Error: ${error.message}`);
  console.error(`Stack Trace: ${error.stack}`);
  console.log("------ ERROR SHORTHAND END ------");
}

export function parseError(error: unknown) {
  if (!(error instanceof Error)) {
    return;
  }
  const stackLines = error.stack?.split("\n");
  if (!stackLines) {
    console.error("Error stack trace not available.");
    parseErrorShorthand(error);
    return;
  }

  const stackTrace = stackLines
    .slice(1)
    .map((line) => line.trim())
    .join("\n");

  const fileNameMatch = stackTrace.match(/\((.*?\.tsx?):(\d+):(\d+)\)/);
  const functionNameMatch = stackTrace.match(/at\s(.*?)\s\(/);

  if (!fileNameMatch || !functionNameMatch) {
    console.error("Error parsing stack trace.");
    parseErrorShorthand(error);
    return;
  }

  const fileName = fileNameMatch[1];
  const lineNumber = fileNameMatch[2];
  const columnNumber = fileNameMatch[3];
  const functionName = functionNameMatch[1];

  console.log("------- FULL ERROR START -------");
  console.log(error);
  console.log("------- FULL ERROR END -------");

  console.log("\n\n------ ERROR DETAILS ------");
  console.log("Function:", functionName);
  console.log("File:", fileName);
  console.log("Line:", lineNumber);
  console.log("Column:", columnNumber);
  console.log("Message:", error.message);
  console.log("Stack Trace:\n", stackTrace);
  console.log("------ ERROR DETAILS END ------");

  console.log("\n\n------ ERROR SHORTHAND ------");
  console.log("Function:", functionName);
  console.log("File:", fileName);
  console.log("Line:", lineNumber);
  console.log("Message:", error.message);
  console.log("------ ERROR SHORTHAND END ------");
}
