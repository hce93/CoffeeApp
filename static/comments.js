// function to submit new comment form to django view
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

// function to delete a comment
$(document).on('click', '.delete', function(event){
    event.preventDefault()
    var $button = $(this)
    var id = $button.attr('value')
    var url = delete_comment_url + id
    $.ajax({
        type:'GET',
        url:url,
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

// function to remove the outer span if there is no comments to a review
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

// function to create a new element with specified class names, ids, display types etc
function createElement(tag, id = null, className = null, display = null, innerHTML = null, viewComment = null){
    var element = document.createElement(tag)
    if(id!=null){
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

function toggleDiv(element){
    var comment_div = element.parentNode.parentNode
    var replybox = comment_div.querySelector('.reply-box')
    if (replybox.style.display === "none") {
        replybox.style.display = "block";
    } else {
        replybox.style.display = "none";
    }
}