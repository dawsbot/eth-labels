tableBody = $('#table-subcatid-0 > tbody');
children = a.children()
toCopy = ''
$.map(children, child => {
    toCopy += child.innerHTML + '\n'
})
copy(toCopy)
