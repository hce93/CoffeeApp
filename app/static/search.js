// contians sorting functionality for the search functions in the site
document.getElementById('sort-options').addEventListener('change', function(){
    // determine sort seleted by user
    const sort_query = this.value;
    const srule = this.getAttribute('desc')?this.getAttribute('desc'):1
    updateHref('sort', sort_query, srule)
})

// search functionality
document.getElementById('search-form').addEventListener('submit', function(){
    event.preventDefault()
    const form = this
    const search_query=form.querySelector('input').value
    updateHref('search', search_query)
})

function changePage(page_number){
    updateHref('page', page_number)
}

// generate search url
// use 0 or 1 for desc or asc
function updateHref(element, query, desc=0){
    let url = new URL(window.location.href)
    let params = new URLSearchParams(url.search)
    params.set(element, query)
    // reset the page number unless the request is to change the page number
    if(element != 'page'){
        params.set('page',1)
    }
    window.location.href=`?${params}`
}