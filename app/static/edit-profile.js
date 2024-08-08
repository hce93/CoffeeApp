var image_input = document.getElementById('id_profile_image')
// event listener to handle user changing profile picutre and then update the picture shown on the page
image_input.addEventListener('change', function(){
    url=edit_profile_url + image_input.getAttribute('user')
    var fd = new FormData();
    var file = image_input.files[0]
    fd.append('profile_image', file)
    fd.append('csrfmiddlewaretoken', csrfToken)
    // append tag to be used in views file to show image is being changed
    fd.append('image_change', true)
    $.ajax({
        type:"POST",
        url:url,
        processData: false,
        contentType: false,
        data:fd,
        success: function(response){
            var live_image = document.getElementById("current_profile_image")
            live_image.setAttribute('src', response.image_url)
        }
    })
})