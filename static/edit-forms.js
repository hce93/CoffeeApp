//logic to open edit the comment or review window
$(document).ready(function(){
    $(document).on('click', '.edit-review-comment', function(){
        var button = $(this)
        var type=button.attr('type')
        if(type=="comment"){
            var div=button.closest('.comment-div')
        } else{
            var div=button.closest('.review-div')
        }
        div.find('#editCommentModal').modal('show');
    })
})

// inherit
//logic to capture form submission to edit comment or form
$(document).on('submit', '.edit-form', function(event){
    event.preventDefault()
    sendEditRequest($(this))
})

// inherit
// function to send post request for editing comment or review
function sendEditRequest(button){
    var form=button.closest('.edit-form')
    var id=form.attr('record_id')
    context={
        'csrfmiddlewaretoken':csrfToken
    }
    type=form.attr('record_type')
    context['type']=type
    context['content']=form.find('#id_content').val()
    if(type=="review"){
        context["rating"] = form.find('#id_rating').val()
    }
    var url = edit_review+id

    //send post request to django view
    $.ajax(({
        type:"POST",
        url:url,
        data:context,
        success: function(response){
            if(type=="comment"){
                var div = form.closest('.comment-div')   
            } else {
                var div = form.closest('.review-div')
            }
            if(response.success){  
                var content=div.find('.content')[0]
                var text = context['content'].split('\n').map(line=>`<p>${line}</p>`).join('')
                // console.log("TEXT: ", context['content'])
                content.innerHTML=text
                // if a review is being edited then update the rating and the coffees average rating
                if(context['type']=="review"){
                    div.find('.main-ratings')[0].setAttribute('rating', context['rating'])
                    // update the rating on the form so the stars can update there too
                    form.find('.rating-holder')[0].setAttribute('rating', context['rating'])
                    updateStars()
                    if(document.getElementById('avg_rating')!=null){
                        document.getElementById('avg_rating').setAttribute('value',getAverageRating())
                        setAverageRating()  
                    }
                    try {
                        truncateText(checkPath())
                    } catch(ReferenceError){
                        //pass
                        console.log("Ignoring attempt to truncate text")
                    }
                    
                }
            } else{
                alert("An error occured")
            }
            // close edit comment window
            div.find('#editCommentModal').modal('hide')
        }
    }))
}