tableBody = $("#table-subcatid-0 > tbody");
children = tablebody.children();
toCopy = "";
$.map(children, (child) => {
  toCopy += child.innerHTML + "\n";
});
copy(toCopy);
