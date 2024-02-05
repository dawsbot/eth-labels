import * as cheerio from "cheerio";

/**
 * Pass in html from the wordcloud page like https://etherscan.io/labelcloud
 */
const selectAllAnchors = (html: string): ReadonlyArray<string> => {
  const $ = cheerio.load(html);
  const parent = $(
    "#content > div.container-xxl.pb-12.mb-1.mt-4 > div > div > div.row.mb-3"
  );

  let anchors: ReadonlyArray<string> = [];
  parent.find("div > div > ul > li > a").each((index, element) => {
    const pathname = $(element).attr("href");
    const href = `https://etherscan.io${pathname}`;
    if (typeof pathname === "string") {
      anchors = [...anchors, href];
    }
  });
  return anchors;
};
export const fetchAllLabels = async (): Promise<ReadonlyArray<string>> => {
  const labelCloudHtml = await fetch("https://etherscan.io/labelcloud", {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Brave";v="120"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": '""',
      "sec-ch-ua-platform": '"macOS"',
      "sec-ch-ua-platform-version": '"14.2.1"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "sec-gpc": "1",
      "upgrade-insecure-requests": "1",
      cookie:
        "ASP.NET_SessionId=rolveb2dvsq0icbzbzmpq1q1; etherscan_offset_datetime=-7; __cflb=0H28vPcoRrcznZcNZSuFrvaNdHwh857Kj7TEbeqWZyn; _gid=GA1.2.1131505400.1706896548; cf_clearance=zoPMz.s9IbngBlMC2ytIwbq_eX7riVLZbhY8c3jaHdc-1706908955-1-AfeVzR4O16fDhjY6zos3TNZUhvMYzZl/oRAjH5RFti/v2iybd0LbQl2aj8PfS2x5rbf4OJGxjZKBmT/HG/eAItI=; etherscan_cookieconsent=True; __stripe_mid=5a3f1702-cf75-4ed4-974b-5c0ef05bfcba2407d2; __stripe_sid=80cccbab-bc7d-44e7-b23a-1cd988c876d9fea8a7; etherscan_pwd=4792:Qdxb:Ovz+XFD19NPaTyhg8zM+MaMTfhAdUC3HPIOsr4sPrOE=; etherscan_userid=bolddd123232; etherscan_autologin=True; _ga=GA1.2.1955973123.1705527392; _ga_T1JC9RNQXV=GS1.1.1706908914.10.1.1706910249.60.0.0",
      Referer: "https://etherscan.io/chart/address",
      "Referrer-Policy": "origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  }).then((res) => res.text());

  const allAnchors = selectAllAnchors(labelCloudHtml);
  return allAnchors;
};

async function fetchAddressesHtml(url: string): Promise<string> {
  const html = await fetch(url, {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Brave";v="120"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": '""',
      "sec-ch-ua-platform": '"macOS"',
      "sec-ch-ua-platform-version": '"14.2.1"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "sec-gpc": "1",
      "upgrade-insecure-requests": "1",
      cookie:
        "ASP.NET_SessionId=rolveb2dvsq0icbzbzmpq1q1; etherscan_offset_datetime=-7; etherscan_cookieconsent=True; __stripe_mid=5a3f1702-cf75-4ed4-974b-5c0ef05bfcba2407d2; etherscan_pwd=4792:Qdxb:Ovz+XFD19NPaTyhg8zM+MaMTfhAdUC3HPIOsr4sPrOE=; etherscan_userid=bolddd123232; etherscan_autologin=True; _gid=GA1.2.348085645.1707082526; __cflb=02DiuFnsSsHWYH8WqVXbZzkeTrZ6gtmGUPPiU67mv9Gyi; cf_clearance=D234ktz_U.bSlP7mFQvVdSN1Lk75XPMg9T1qx_U528Q-1707082569-1-AdN5JUm7hTyQAmdNZ480K7nIxnagXgVOF6943xbZiPubtZXioR9nQ47Ou9Vc/ds5anS8vUjEkaZhvIJ8o83G96w=; _ga_T1JC9RNQXV=GS1.1.1707082525.11.1.1707084084.60.0.0; _ga=GA1.2.1955973123.1705527392",
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
  }).then((res) => res.text());

  return html;
}

type AddressInfo = {
  address: string;
  nameTag: string;
  balance: string;
  transactionCount: string;
};
type AddressesInfo = ReadonlyArray<AddressInfo>;

/**
 * Pass in html from a page like https://etherscan.io/accounts/label/augur
 */
function selectAllAddresses(html: string): AddressesInfo {
  const $ = cheerio.load(html);
  const parent = $("#table-subcatid-1 > tbody");

  console.log({ parent });
  let addressesInfo: AddressesInfo = [];
  parent.find("tr").each((index, trElement) => {
    const tds = $(trElement).find("td");
    console.log({ trElement, tds });

    const newAddressInfo: AddressInfo = {
      address: $(tds[0]).text(),
      nameTag: $(tds[1]).text(),
      balance: $(tds[2]).text(),
      transactionCount: $(tds[3]).text(),
    };

    addressesInfo = [...addressesInfo, newAddressInfo];
  });
  return addressesInfo;
}

(async () => {
  //   await fetchAllLabels();
  const url = "https://etherscan.io/accounts/label/augur";
  const addressesHtml = await fetchAddressesHtml(url);
  console.log(addressesHtml);
  const allAddresses = selectAllAddresses(addressesHtml);
  console.dir(allAddresses);
})();
