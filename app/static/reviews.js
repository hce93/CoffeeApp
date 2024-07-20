// function to submit new review form to django view
$(document).on('submit', '#review-form', function(event){
    //prevent default refreshing of the page
    event.preventDefault();
    var $form = $(this)
    var id = $form.find('input[id="hidden"]').val()
    var type = $form.find('input[id="hidden"]').attr('name')
    var url = create_review_url + id
    var content = $form.find('textarea')
    var rating = $form.find('input[name="rating"]')
    $.ajax({
        url: url,
        type:'POST',
        data:{
            "csrfmiddlewaretoken": csrfToken,
            "content":content.val(),
            "rating":rating.val(),
            "type":type
        },
        success: function(response){
            var tempContainer
            var tempDiv
            new Promise(function(resolve){
                tempContainer = createElement('div', null, 'review-container')
                tempDiv=createElement('div', null, "review-div")
                tempDiv.innerHTML = response.html
                var rating_holder = tempDiv.querySelector('div.rating-holder')
                rating_holder.innerHTML=generateStars(rating_holder.getAttribute('rating'))
                resolve()
            }).then(function(){
                tempContainer.appendChild(tempDiv)
            }).then(function(){
                $form[0].parentNode.append(tempContainer)

                // reset the review form
                $form.closest('#review-form')[0].style.display="none"
                content.val("")
                $form.find('.avg_star').css("color","#ddd")
                $form.closest('#review-form').siblings('#review-errors')[0].innerHTML=""
            }).then(function(){
                //update stars for new rating
                const rating_count_element=document.getElementById('avg-rating-count')

                rating_count_element.innerHTML=parseFloat(rating_count_element.innerHTML)+1
                document.getElementById('avg_rating').setAttribute('value',getAverageRating())
                
            }).then(function(){
                setAverageRating()
            }).then(function(){
                truncateText()
            })

        },
        error: function(xhr, status, error){
            $('#review-errors').text('An error occured: ' + error).show()
            $('#review-errors').append(xhr.responseJSON.errors)
            console.log(xhr.responseJSON.errors)
            
        }
    })
})

// function to delete a review
$(document).on('click', '.delete-review', function(event){
    event.preventDefault()
    var $button = $(this)
    var single_review_bool=$button.attr('single_review')
    var id = $button.attr('value')
    var url = delete_review_url + id
    $.ajax({
        type:'POST',
        url:url,
        data:{
            'csrfmiddlewaretoken': csrfToken
        },
        success: function(response){
            new Promise(function(resolve){
                var parent = $button.closest('.review-container')
                parent.remove()
                // if currently on the single review page we redirect to the main page for the specific coffee
                if(single_review_bool=="True"){
                    var href=document.getElementById('return-to-coffee').href
                    console.log(href)
                    window.location.href=href
                }
                resolve()
            }).then(function(){
                //update stars for new rating
                const rating_count_element=document.getElementById('avg-rating-count')
                rating_count_element.innerHTML=parseFloat(rating_count_element.innerHTML)-1
                document.getElementById('avg_rating').setAttribute('value',getAverageRating())
                
            }).then(function(){
                // set star ratings
                setAverageRating()
            })
        }
    })
})


// function to display review form 
function showReviewForm(){
    var form = document.getElementById("review-form")
    var display = getComputedStyle(form).display
    if(display == "none"){
        form.style.display = "flex"
    }else{
        form.style.display = "none"
    }
}