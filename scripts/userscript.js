// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://etherscan.io/accounts/label/phish-hack?subcatid=undefined&size=100&start=0&col=1&order=asc
// @icon         https://www.google.com/s2/favicons?sz=64&domain=etherscan.io
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  const length = 100;
  const pages = 56;
  let draw = 1;
  
  const payload = {
    labelModel: {
      label: "phish-hack"
    },
    dataTableModel: {
      draw,
      length,
      start: 0,
      search: {
        value: "",
        regex: false
      },
      order: [
        {
          column: 1,
          dir: "asc"
        }
      ],
      columns: [
        {
          data: "address",
          name: "",
          searchable: true,
          orderable: false,
          search: { value: "", regex: false }
        },
        {
          data: "nameTag",
          name: "",
          searchable: true,
          orderable: false,
          search: { value: "", regex: false }
        },
        {
          data: "balance",
          name: "",
          searchable: true,
          orderable: true,
          search: { value: "", regex: false }
        },
        {
          data: "txnCount",
          name: "",
          searchable: true,
          orderable: true,
          search: { value: "", regex: false }
        }
      ]
    }
  }
  
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function run(){
    const values = [];
    const hacks = [];
    const csv = [["address", "nameTag", "balance", "txnCount"]];

    for (let index = 1; index <= pages; index++) {
      payload.dataTableModel.draw = draw++;
      payload.dataTableModel.start = (index - 1) * length;
      const response = await fetch("https://etherscan.io/accounts.aspx/GetTableEntriesBySubLabel", {
        method: "POST",
        headers: [
          ["Content-Type", "application/json; charset=utf-8"]
        ],
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      const data = json.d.data;
      const newData = data.map((v) => {
        return {
          address: v.address.replace(/<[^<>]+>/g,""),
          balance: v.balance.replace(/<[^<>]+>/g,""),
          nameTag: v.nameTag,
          txnCount: v.txnCount
        }
      });
      values.push(newData);
      await sleep(3000);
    }

    values.forEach((v) => {
      v.forEach((k) => {
        hacks.push(k);
        csv.push([k.address, k.nameTag, k.balance, k.txnCount]);
      })
    });

    const createCSVData = csv.map((v) => {
      return v.join(',')
    }).join('\n');

    console.log(JSON.stringify(hacks));
    console.log(JSON.stringify(createCSVData));
  }

  run();
})();