// event listener to send user to search page with their likes
document.getElementById('user_likes').addEventListener('click', function(){
    let url="/all_coffees?likes=true"
    window.location.href=url
})

// event listener to send user to search page with their likes
document.getElementById('user_bookmarks').addEventListener('click', function(){
    let url="/all_coffees?bookmarks=true"
    window.location.href=url
})
