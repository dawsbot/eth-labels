import { format } from "prettier";
export class FileFormatter {
  public async formatFile(
    fileName: string,
    fileContents: string,
  ): Promise<string> {
    const formattedData = await format(fileContents, { filepath: fileName });
    return formattedData;
  }
}
