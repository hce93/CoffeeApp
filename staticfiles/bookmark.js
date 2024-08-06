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

                // check if anyother bookmark buttons for the same coffee are on the page

                var bookmark_buttons = Array.from($('.bookmark'))
                if(bookmark_buttons.length>1){
                    for(var bookmark in bookmark_buttons){
                        if(!$(bookmark_buttons[bookmark]).is(button)){
                            if($(bookmark_buttons[bookmark]).is('#'+id)){
                                if(bookmark_buttons[bookmark].classList.contains('saved')){
                                    bookmark_buttons[bookmark].classList.remove('saved')
                                } else {
                                    bookmark_buttons[bookmark].classList.add('saved')
                                }
                            }
                        }
                        
                    }
                }
            }
        })
    })
})