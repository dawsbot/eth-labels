import type { Cheerio, CheerioAPI, Element } from "cheerio";
import * as cheerio from "cheerio";

export class CheerioParser {
  #$: CheerioAPI;

  public constructor() {
    this.#$ = cheerio.load("");
  }

  public loadHtml = (html: string): void => {
    this.#$ = cheerio.load(html);
  };

  public find = (element: Element, selector: string) => {
    const elements = this.#$(element).find(selector);
    return elements;
  };

  public getAttr = (element: Element, attr: string) => {
    const value = this.#$(element).attr(attr);
    return value;
  };

  public querySelector = (selector: string): Cheerio<Element> => {
    const element = this.#$(selector) as Cheerio<Element>; // when the selector string in not static the return type is Cheerio<AnyNode>
    return element;
  };

  public querySelectorAll = (selector: string) => {
    const elements = this.#$(selector);
    return elements;
  };

  public text(element: Element) {
    return this.#$(element).text();
  }

  public selectAllLabels = (html: string): ReadonlyArray<string> => {
    this.loadHtml(html);
    const parent = this.querySelector("div > div > div.row.mb-3");
    let anchors: ReadonlyArray<string> = [];
    parent.find("a").each((index, element) => {
      const pathname = this.getAttr(element, "href");
      if (typeof pathname !== "string") {
        console.log(`returning early because "${pathname}" is not a string`);
        return;
      }
      const maxRecordsLength = 10_000;
      const size = this.text(element);
      const regex = /\((.*?)\)/;
      const recordCount = Number(regex.exec(size)?.[1]);

      if (pathname.includes("tokens")) {
        const href = `${pathname}?size=100&start=0`;
        anchors = [...anchors, href];
      } else if (
        pathname.includes("accounts") &&
        recordCount < maxRecordsLength
      ) {
        const href = `${pathname}?size=${maxRecordsLength}`;
        anchors = [...anchors, href];
      }
    });
    return anchors;
  };
}
