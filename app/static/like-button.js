$(document).ready(function(){
    $(document).on('click', '.like-button', function(){
        var $button = $(this)
        var $div = $button.closest('div')
        var id = $div.attr('id')
        //need to pass the like url from the template to here
        var url = like_url + id
        var type = $button.find('input').val()
        $.ajax({
            type:'POST',
            url:url,
            data:{
                'type':type,
                'csrfmiddlewaretoken': csrfToken
            },
            success: function(response){
                if(response.msg=="success"){
                    var image = $button.find('i')
                    if(image.hasClass("fa-solid")){
                        image.removeClass('fa-solid').addClass('fa-regular');
                    } else {
                        image.removeClass('fa-regular').addClass('fa-solid');
                    }
                    count=$button.find(".like-count")
                    count.html(response.count)
                }
            }
        })
    })
})