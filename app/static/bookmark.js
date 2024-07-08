$(document).ready(function(){
    $(document).on('click', '.bookmark', function(){
        var button = $(this)
        var id = button.attr('id')
        var url = bookmark_url + id

        $.ajax({
            type:'POST',
            url:url,
            data:{

                'csrfmiddlewaretoken': csrfToken
            },
            success: function(response){
                button=button[0]
                console.log(button)
                if(response.success){
                    if(button.classList.contains('saved')){
                        button.classList.remove('saved')
                    } else {
                        button.classList.add('saved')
                    }
                }
            }
        })
    })
})