//event listener top add the ratings for each review once dom loaded
document.addEventListener('DOMContentLoaded',function(){
    updateStars()
}
)

function updateStars(){
    var rating_holders = document.getElementsByClassName('rating-holder')
    console.log("HELP!!!!")
    for(var i=0; i<rating_holders.length;i++){
        html=generateStars(rating_holders[i].getAttribute('rating'))
        rating_holders[i].innerHTML=html
    }
}

// function to generate html for review ratings
function generateStars(rating){
    html=``
    filled_template = `<span class="material-symbols-outlined star" style="font-variation-settings: 'FILL' 1;">star</span>`
    empty_template = `<span class="material-symbols-outlined star" style="font-variation-settings: 'FILL' 0;">star</span>`
    for(var i = 1; i<=5; i++){
        if(i<=rating){
            html+=filled_template
        } else {
            html+=empty_template
        }
    }
    return html
}

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

$(document).ready(function(){
    $(document).on('click', '.add-diary', function(){
        var button = $(this)
        var id = button.attr('id')
        var url = diary_url + id

        $.ajax({
            type:'POST',
            url:url,
            data:{

                'csrfmiddlewaretoken': csrfToken
            },
            success: function(response){
                if(response.success){
                    console.log(button)
                    button[0].classList.add('added')
                    button[0].classList.remove('add-diary')
                    button.attr('title',"Already added to diary")
                }
            }
        })
    })
})

$(document).ready(function(){
    $(document).on('click', '.like-button', function(){
        var $button = $(this)
        var $div = $button.closest('div')
        var id = $div.attr('id')
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

$('.star').hover(function(){
    var icon = $(this)
    var prior_siblings = icon.prevAll()
    if(icon.parent()[0].classList.contains('selected')){
        //
    }else{
        icon.css("font-variation-settings","'FILL' 1")
        prior_siblings.css("font-variation-settings","'FILL' 1")
    }
    

},function(){
    // This function will execute when mouse leaves the element
    var icon = $(this);
    var prior_siblings = icon.prevAll();
    if(icon.parent()[0].classList.contains('selected')){
        //
    }else{
        prior_siblings.css("font-variation-settings", "'FILL' 0"); 
        icon.css("font-variation-settings","'FILL' 0")
    }
    
})

$('.star').click(function(){
    var icon = $(this)
    var prior_siblings = icon.prevAll()
    var next_siblings = icon.nextAll()

    icon.css("font-variation-settings","'FILL' 1")
    prior_siblings.css("font-variation-settings","'FILL' 1")
    next_siblings.css("font-variation-settings","'FILL' 0")

    icon.parent().addClass('selected')
    icon.parent().siblings('#id_rating').val(icon.attr('value'))
})


$(document).on('submit', '.comment-form', function(event){
    //prevent default refreshing of the page
    event.preventDefault();
    var $form = $(this)
    var id = $form.find('input[id="hidden"]').val()
    var type = $form.find('input[id="hidden"]').attr('name')
    var url = create_comment_url + id
    var content = $form.find('textarea')
    var test_parent = $form.closest('.comment-div')[0]

    $.ajax({
        url: url,
        type:'POST',
        data:{
            "csrfmiddlewaretoken": csrfToken,
            "content":content.val(),
            "type":type
        },
        success: function(response){
            var tempContainer;
            if(test_parent){
                var nextDiv = findNextTag(test_parent, 'div', 'reply')  
                if(nextDiv){
                    // if replies exist at same level we append to the reply div
                    tempContainer=createElement('div', null, null, null, response.html)
                    nextDiv.append(createElement('div', null, null, null, response.html).firstChild)

                    // ensure comment is visible when submitted
                    console.log("Checking span")
                    next_span = findNextTag(test_parent, 'span', 'material-symbols-outlined')
                    console.log(next_span)
                    viewComments(next_span, true)

                    // need to ensure outer comments are shown

                }else{
                    // if no replies exist we create a reply div and add the comment
                    tempContainer=createElement('div', 'hidden-div', 'reply', 'block', response.html)
                    tempSpan=createElement('span', null, 'material-symbols-outlined inner-comments-span', null, "expand_less", true)
                    if(test_parent.nextSibling){
                        new Promise(function(resolve) {
                            test_parent.parentNode.insertBefore(tempContainer, test_parent.nextElementSibling)
                            resolve()
                        }).then(function() {
                            test_parent.parentNode.insertBefore(tempSpan, test_parent.nextElementSibling)
                        });
                    } else{
                        new Promise(function(resolve) {
                            test_parent.parentNode.append(tempSpan)
                            resolve()
                        }).then(function() {
                            test_parent.parentNode.append(tempContainer)
                        });
                    }
                }
            }else{
                // if a new comment to the review, create a new comment div to hold it and any replies
                test_parent = $form.closest('.review-div')[0]
                tempContainer = createElement('div',null,'outer-comment-div', null, response.html)
                test_parent.parentNode.append(tempContainer)
                // add hide comment span
                addShowHideComments(test_parent)
            }
            $form.closest('.reply-box')[0].style.display="none"
            content.val("")

            //update comment count
            var comment_count = $form.closest('.review-container').find('.comment-count')[0]
            comment_count.innerHTML=Number(comment_count.innerHTML)+1
        }
    })
})

$(document).on('submit', '#review-form', function(event){
    //prevent default refreshing of the page
    event.preventDefault();
    var $form = $(this)
    var id = $form.find('input[id="hidden"]').val()
    var type = $form.find('input[id="hidden"]').attr('name')
    var url = create_review_url + id
    console.log(url)
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
                var rating = tempDiv.querySelector('div.rating-holder')
                rating.innerHTML=generateStars(rating.getAttribute('rating'))
                console.log(rating)
                resolve()
            }).then(function(){
                tempContainer.appendChild(tempDiv)
            }).then(function(){
                $form[0].parentNode.append(tempContainer)
            })

            // reset the review form
            $form.closest('#review-form')[0].style.display="none"
            content.val("")
            $form.find('.star').css("font-variation-settings","'FILL' 0")
            $form.closest('#review-form').siblings('#review-errors')[0].innerHTML=""
            //update stars for new rating
            
        },
        error: function(xhr, status, error){
            $('#review-errors').text('An error occured: ' + error).show()
            $('#review-errors').append(xhr.responseJSON.errors)
            console.log(xhr.responseJSON.errors)
            
        }
    })
})


$(document).on('click', '.delete', function(event){
    event.preventDefault()
    var $button = $(this)
    var id = $button.attr('value')
    var url = delete_comment_url + id
    $.ajax({
        type:'POST',
        url:url,
        data:{
            'csrfmiddlewaretoken': csrfToken
        },
        success: function(response){
            console.log(response.success)
            var parent = $button.closest('.reply')
            var comment_count = $button.closest('.review-container').find('.comment-count')[0]
            
            if(response.all_children_deleted){
                //if children to the element have been deleted
                console.log("a")
                parent.siblings('.inner-comments-span').remove()
                console.log(parent)
                parent.remove()
            }else if(parent[0] || response.content!=""){
                // if children not deleted and reply exists
                console.log("b")
                //override parent attribute to the comment itself
                parent = $button.closest('.comment-div')
                var siblings = parent.siblings('.comment-div')[0]
                if(response.content){
                    //if children not deleted we update content of message to [deleted...]
                    console.log("c")
                    parent.find('p')[0].innerHTML=response.content
                    parent.find('.like-button').removeClass('like-button')
                    parent.find('.fa-heart').addClass('deleted')
                    parent.find('.fa-comment').addClass('deleted')
                    parent.find('.like-button').removeClass('like-button')
                    parent.find('.comment').removeAttr('onclick')
                    parent.find('.delete').remove()
                }else if(!siblings){
                    // if no siblings we
                    console.log("d")
                    console.log("No siblings")
                    var comment
                    var span
                    new Promise(function(resolve){
                        //first load elements to be removed
                        comment = parent.parent()
                        span = comment.siblings('.inner-comments-span')
                        console.log(comment)
                        console.log(span)
                        resolve()
                    }).then(function(){
                        comment.remove()
                        span.remove()
                    })

                } else{
                    console.log("e")
                    console.log("siblings")
                    // remove the comment
                    parent.remove()
                }
            } else{
                //removes outer comment and span
                console.log("f")
                parent = $button.closest('.outer-comment-div')
                var siblings = parent.siblings('.outer-comment-div')[0]
                if(!siblings){
                    parent.siblings('.outer-comments-span').remove()
                    parent.remove()
                } else{
                    parent.remove()
                }
            }

            if(response.to_remove.length>0){
                console.log("g")
                var parent_div;
                for(var remove_id in response.to_remove){
                    if(response.to_remove[remove_id]!=id){
                        var comment_div = $('div.comment-div[value='+response.to_remove[remove_id]+']')
                        if(comment_div.siblings('.comment-div').length==0){
                            var parent_span = comment_div.parent().siblings('.inner-comments-span')
                            parent_span.remove()
                        }
                        remove_span_if_no_comments(comment_div)
                        comment_div.remove()
                    }
                }
            }

            // update review comment count
            comment_count.innerHTML=response.comment_count
        }
    })
})


$(document).on('click', '.delete-review', function(event){
    event.preventDefault()
    var $button = $(this)
    var id = $button.attr('value')
    var url = delete_review_url + id
    $.ajax({
        type:'POST',
        url:url,
        data:{
            'csrfmiddlewaretoken': csrfToken
        },
        success: function(response){
            var parent = $button.closest('.review-container')
            parent.remove()
        }
    })
})


// function to remove the outer span if there is no comemnts to a review
function remove_span_if_no_comments(element){
    var comment_siblings = element.parent().siblings('.outer-comment-div')
    if(comment_siblings.length==0){
        var span_to_remove = element.parents().siblings('.outer-comments-span')
        console.log(span_to_remove)
        span_to_remove.remove()
    }
}


function addShowHideComments(element){
    var span_elements = Array.from(element.parentNode.children).filter(child => child.classList.contains("outer-comments-span"))
    if (span_elements.length == 0){
        var new_span = createElement('span', null, 'outer-comments-span', null, "Show comments...")
        new_span.addEventListener("click", function(){
            showOuterComments(this)
        })
        element.parentNode.insertBefore(new_span, element.nextSibling)
        showOuterComments(new_span, true)
    } else {
        // display comments if span already exists
        showOuterComments(span_elements[0], true)
    }
}

function createElement(tag, id = null, className = null, display = null, innerHTML = null, viewComment = null){
    var element = document.createElement(tag)
    if(id!=null){
        console.log("In the id if")
        console.log(id)
        element.id=id
    }
    if(className!=null){element.classList.add(...className.split(' '))}
    if(display!=null){element.style.display=display}
    if(innerHTML!=null){element.innerHTML=innerHTML}
    if(viewComment!=null){
        element.addEventListener("click", function(){
            viewComments(this)
        })
    }
    return element
}


function findNextTag(element, tag, className){
    let sibling = element.nextElementSibling;
    while(sibling){
        if(sibling.tagName.toLowerCase()===tag.toLowerCase()){
            if(sibling.classList.contains(className)){
                return sibling
            }
            return null
        }
        sibling = sibling.nextElementSibling
    }
    return null;
}

function toggleDiv(element){
    var comment_div = element.parentNode.parentNode
    var replybox = comment_div.querySelector('.reply-box')
    if (replybox.style.display === "none") {
        replybox.style.display = "block";
    } else {
        replybox.style.display = "none";
    }
}

function viewComments(element, override=false){
    var hidden_comments = element.nextElementSibling
    var next_div = hidden_comments.querySelector(".comment-div")
    var next_span = hidden_comments.querySelector(".material-symbols-outlined")
    if(next_span){
        next_span.style.paddingLeft=next_div.style.marginLeft
    }
    if (hidden_comments.style.display === "none" || override==true) {
        element.innerHTML="expand_less"
        hidden_comments.style.display = "block";
    } else {
        element.innerHTML="expand_more"
        hidden_comments.style.display = "none";
    }

}

function showOuterComments(element, override=false){
    var siblings = element.parentElement.children
    var display
    for (var i =0; i<siblings.length; i++){
        if (siblings[i].classList.contains('outer-comment-div')){
            display = getComputedStyle(siblings[i]).display
            if(display == "none" || override==true){
                siblings[i].style.display = "block"
                element.innerHTML="Hide comments..."
            } else {
                siblings[i].style.display = "none"
                element.innerHTML="Show comments..."
            }
        }
    }
}

function showReviewForm(){
    var form = document.getElementById("review-form")
    var display = getComputedStyle(form).display
    if(display == "none"){
        form.style.display = "block"
    }else{
        form.style.display = "none"
    }
}
