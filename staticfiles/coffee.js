// // inherited done
// //event listener top add the ratings for each review once dom loaded
// document.addEventListener('DOMContentLoaded',function(){
//     updateStars()
//     setAverageRating()
// })
// // inherited done
// function updateStars(){
//     var rating_holders = document.getElementsByClassName('rating-holder')
//     for(var i=0; i<rating_holders.length;i++){
//         // if the rating is for the edit window then we need to just update the colours and not generate the full html
//         if(rating_holders[i].classList.contains('edit')){
//             children = rating_holders[i].children       
//             rating = parseInt(rating_holders[i].getAttribute('rating'))
//             for(var x=0; x<children.length;x++){
//                 if(x<rating){
//                     children[x].style.color="black"
//                 }else{
//                     children[x].style.color="#ddd"
//                 }
//             }
//             // generate html if not part of edit window
//         }else{
//             html=generateStars(rating_holders[i].getAttribute('rating'))  
//             rating_holders[i].innerHTML=html  
//         }
//     }
// }
// // inherited done
// function getAverageRating(){
//     var rating_holders=document.getElementsByClassName('main-ratings')
//     var rating_sum=0
//     var rating_count=rating_holders.length
//     console.log(rating_holders)
//     for(var i=0; i<rating_count; i++){
//         console.log('awejlfhlkefj')
//         rating_sum+=parseFloat(rating_holders[i].getAttribute('rating'))
//     }
//     return rating_sum/rating_count
// }
// // inherited done
// function setAverageRating(){
//     console.log("average rating: ", getAverageRating())
//     const star_div = document.getElementById("avg_rating")
//     const stars = star_div.getElementsByClassName('avg_star')
//     const rating = star_div.getAttribute('value')
//     const floor = Math.floor(rating)
//     for(var x=0; x<stars.length; x++){
//         if(x<floor){
//             stars[x].style.setProperty('--percent', `100%`)
//             stars[x].style.color="black"
//         }else{
//             stars[x].style.setProperty('--percent', `0%`)
//         }
//     }
//     if(rating %1!=0){
//         stars[floor].classList.add('partial')
//         stars[floor].style.setProperty('--percent', `${(rating%1)*100}%`)
//         stars[floor].style.color="black"
//     }
// }
// // inherited done
// // function to generate html for review ratings
// function generateStars(rating, edit=false){
//     html=``
//     if(edit){
//         // modify existing element if we allow editing so the hover functions etc from the dom will work

//         filled_template = `<span class="new_star" style="color: black;"></span>`
//         empty_template = `<span class="new_star" style="color: #ddd;"></span>`
//     }else{
//         filled_template = `<span class="avg_star" style="color: black;"></span>`
//         empty_template = `<span class="avg_star" style="color: #ddd;"></span>`
//     }
    
//     for(var i = 1; i<=5; i++){
//         if(i<=rating){
//             html+=filled_template
//         } else {
//             html+=empty_template
//         }
//     }
//     return html
// }

// // done
// $(document).ready(function(){
//     $(document).on('click', '.bookmark', function(){
//         var button = $(this)
//         var id = button.attr('id')
//         var url = bookmark_url + id

//         $.ajax({
//             type:'POST',
//             url:url,
//             data:{

//                 'csrfmiddlewaretoken': csrfToken
//             },
//             success: function(response){
//                 button=button[0]
//                 console.log(button)
//                 if(response.success){
//                     if(button.classList.contains('saved')){
//                         button.classList.remove('saved')
//                     } else {
//                         button.classList.add('saved')
//                     }
//                 }
//             }
//         })
//     })
// })

// $(document).ready(function(){
//     $(document).on('click', '.add-diary', function(){
//         var button = $(this)
//         var id = button.attr('id')
//         var already_added = button.attr('added')
//         var accepted
//         new Promise(function(resolve){
//             if(already_added){
//                 accepted=confirm("You already have this coffee in your diary. Would you like to add another entry?")
//             }
//             resolve()
//         }).then(function(){
//             if(accepted){
//                 var url = diary_url + id
//                 $.ajax({
//                     type:'POST',
//                     url:url,
//                     data:{
//                         'csrfmiddlewaretoken': csrfToken
//                     },
//                     success: function(response){
//                         if(response.success){
//                             button.attr('title',"Add another entry to diary")
//                         }
//                     }
//                 })
//             }
//         })  
//     })
// })
// // inherited done
// $(document).ready(function(){
//     $(document).on('click', '.like-button', function(){
//         var $button = $(this)
//         var $div = $button.closest('div')
//         var id = $div.attr('id')
//         var url = like_url + id
//         var type = $button.find('input').val()
//         $.ajax({
//             type:'POST',
//             url:url,
//             data:{
//                 'type':type,
//                 'csrfmiddlewaretoken': csrfToken
//             },
//             success: function(response){
//                 if(response.msg=="success"){
//                     var image = $button.find('i')
//                     if(image.hasClass("fa-solid")){
//                         image.removeClass('fa-solid').addClass('fa-regular');
//                     } else {
//                         image.removeClass('fa-regular').addClass('fa-solid');
//                     }
//                     count=$button.find(".like-count")
//                     count.html(response.count)
//                 }
//             }
//         })
//     })
// })
// // done - review
// // function to enable stars to fill in on the review form as a user hovers over them
// $('.new_star').hover(function(){
//     var icon = $(this)
//     var prior_siblings = icon.prevAll()
//     if(icon.parent()[0].classList.contains('selected')){
//         //
//     }else{
//         icon.css("color","black")
//         prior_siblings.css("color","black")
//     }
//     },function(){
//         // This function will execute when mouse leaves the element
//         var icon = $(this);
//         var prior_siblings = icon.prevAll();
//         if(icon.parent()[0].classList.contains('selected')){
//             //
//         }else{
//             prior_siblings.css("color","#ddd"); 
//             icon.css("color","#ddd")
//         }   
//     })
// // done - review
// // function to maintain colur of stars when user selects the rating
// // if user selects a new rating this function will adjust colours
// $('.new_star').click(function(){
//     var icon = $(this)
//     var prior_siblings = icon.prevAll()
//     var next_siblings = icon.nextAll()

//     icon.css("color","black")
//     prior_siblings.css("color","black")
//     next_siblings.css("color","#ddd")

//     icon.parent().addClass('selected')
//     icon.parent().siblings('#id_rating').val(icon.attr('value'))
// })

// // inherit done - comments
// // function to submit new comment form to django view
// $(document).on('submit', '.comment-form', function(event){
//     //prevent default refreshing of the page
//     event.preventDefault();
//     var $form = $(this)
//     var id = $form.find('input[id="hidden"]').val()
//     var type = $form.find('input[id="hidden"]').attr('name')
//     var url = create_comment_url + id
//     var content = $form.find('textarea')
//     var test_parent = $form.closest('.comment-div')[0]

//     $.ajax({
//         url: url,
//         type:'POST',
//         data:{
//             "csrfmiddlewaretoken": csrfToken,
//             "content":content.val(),
//             "type":type
//         },
//         success: function(response){
//             var tempContainer;
//             if(test_parent){
//                 var nextDiv = findNextTag(test_parent, 'div', 'reply')  
//                 if(nextDiv){
//                     // if replies exist at same level we append to the reply div
//                     tempContainer=createElement('div', null, null, null, response.html)
//                     nextDiv.append(createElement('div', null, null, null, response.html).firstChild)

//                     // ensure comment is visible when submitted
//                     console.log("Checking span")
//                     next_span = findNextTag(test_parent, 'span', 'material-symbols-outlined')
//                     console.log(next_span)
//                     viewComments(next_span, true)

//                     // need to ensure outer comments are shown

//                 }else{
//                     // if no replies exist we create a reply div and add the comment
//                     tempContainer=createElement('div', 'hidden-div', 'reply', 'block', response.html)
//                     tempSpan=createElement('span', null, 'material-symbols-outlined inner-comments-span', null, "expand_less", true)
//                     if(test_parent.nextSibling){
//                         new Promise(function(resolve) {
//                             test_parent.parentNode.insertBefore(tempContainer, test_parent.nextElementSibling)
//                             resolve()
//                         }).then(function() {
//                             test_parent.parentNode.insertBefore(tempSpan, test_parent.nextElementSibling)
//                         });
//                     } else{
//                         new Promise(function(resolve) {
//                             test_parent.parentNode.append(tempSpan)
//                             resolve()
//                         }).then(function() {
//                             test_parent.parentNode.append(tempContainer)
//                         });
//                     }
//                 }
//             }else{
//                 // if a new comment to the review, create a new comment div to hold it and any replies
//                 test_parent = $form.closest('.review-div')[0]
//                 tempContainer = createElement('div',null,'outer-comment-div', null, response.html)
//                 test_parent.parentNode.append(tempContainer)
//                 // add hide comment span
//                 addShowHideComments(test_parent)
//             }
//             $form.closest('.reply-box')[0].style.display="none"
//             content.val("")

//             //update comment count
//             var comment_count = $form.closest('.review-container').find('.comment-count')[0]
//             comment_count.innerHTML=Number(comment_count.innerHTML)+1
//         }
//     })
// })

// // done - reviews
// // function to submit new review form to django view
// $(document).on('submit', '#review-form', function(event){
//     //prevent default refreshing of the page
//     event.preventDefault();
//     var $form = $(this)
//     var id = $form.find('input[id="hidden"]').val()
//     var type = $form.find('input[id="hidden"]').attr('name')
//     var url = create_review_url + id
//     var content = $form.find('textarea')
//     var rating = $form.find('input[name="rating"]')
//     $.ajax({
//         url: url,
//         type:'POST',
//         data:{
//             "csrfmiddlewaretoken": csrfToken,
//             "content":content.val(),
//             "rating":rating.val(),
//             "type":type
//         },
//         success: function(response){
//             var tempContainer
//             var tempDiv
//             new Promise(function(resolve){
//                 tempContainer = createElement('div', null, 'review-container')
//                 tempDiv=createElement('div', null, "review-div")
//                 tempDiv.innerHTML = response.html
//                 var rating_holder = tempDiv.querySelector('div.rating-holder')
//                 rating_holder.innerHTML=generateStars(rating_holder.getAttribute('rating'))
//                 resolve()
//             }).then(function(){
//                 tempContainer.appendChild(tempDiv)
//             }).then(function(){
//                 $form[0].parentNode.append(tempContainer)

//                 // reset the review form
//                 $form.closest('#review-form')[0].style.display="none"
//                 content.val("")
//                 $form.find('.avg_star').css("color","#ddd")
//                 $form.closest('#review-form').siblings('#review-errors')[0].innerHTML=""
//             }).then(function(){
//                 //update stars for new rating
//                 const rating_count_element=document.getElementById('avg-rating-count')

//                 rating_count_element.innerHTML=parseFloat(rating_count_element.innerHTML)+1
//                 document.getElementById('avg_rating').setAttribute('value',getAverageRating())
                
//             }).then(function(){
//                 setAverageRating()
//             })
//         },
//         error: function(xhr, status, error){
//             $('#review-errors').text('An error occured: ' + error).show()
//             $('#review-errors').append(xhr.responseJSON.errors)
//             console.log(xhr.responseJSON.errors)
            
//         }
//     })
// })

// // inherit done - comment
// // function to delete a comment
// $(document).on('click', '.delete', function(event){
//     event.preventDefault()
//     var $button = $(this)
//     var id = $button.attr('value')
//     var url = delete_comment_url + id
//     $.ajax({
//         type:'POST',
//         url:url,
//         data:{
//             'csrfmiddlewaretoken': csrfToken
//         },
//         success: function(response){
//             console.log(response.success)
//             var parent = $button.closest('.reply')
//             var comment_count = $button.closest('.review-container').find('.comment-count')[0]
            
//             if(response.all_children_deleted){
//                 //if children to the element have been deleted
//                 console.log("a")
//                 parent.siblings('.inner-comments-span').remove()
//                 console.log(parent)
//                 parent.remove()
//             }else if(parent[0] || response.content!=""){
//                 // if children not deleted and reply exists
//                 console.log("b")
//                 //override parent attribute to the comment itself
//                 parent = $button.closest('.comment-div')
//                 var siblings = parent.siblings('.comment-div')[0]
//                 if(response.content){
//                     //if children not deleted we update content of message to [deleted...]
//                     console.log("c")
//                     parent.find('p')[0].innerHTML=response.content
//                     parent.find('.like-button').removeClass('like-button')
//                     parent.find('.fa-heart').addClass('deleted')
//                     parent.find('.fa-comment').addClass('deleted')
//                     parent.find('.like-button').removeClass('like-button')
//                     parent.find('.comment').removeAttr('onclick')
//                     parent.find('.delete').remove()
//                 }else if(!siblings){
//                     // if no siblings we
//                     console.log("d")
//                     console.log("No siblings")
//                     var comment
//                     var span
//                     new Promise(function(resolve){
//                         //first load elements to be removed
//                         comment = parent.parent()
//                         span = comment.siblings('.inner-comments-span')
//                         console.log(comment)
//                         console.log(span)
//                         resolve()
//                     }).then(function(){
//                         comment.remove()
//                         span.remove()
//                     })

//                 } else{
//                     console.log("e")
//                     console.log("siblings")
//                     // remove the comment
//                     parent.remove()
//                 }
//             } else{
//                 //removes outer comment and span
//                 console.log("f")
//                 parent = $button.closest('.outer-comment-div')
//                 var siblings = parent.siblings('.outer-comment-div')[0]
//                 if(!siblings){
//                     parent.siblings('.outer-comments-span').remove()
//                     parent.remove()
//                 } else{
//                     parent.remove()
//                 }
//             }

//             if(response.to_remove.length>0){
//                 console.log("g")
//                 var parent_div;
//                 for(var remove_id in response.to_remove){
//                     if(response.to_remove[remove_id]!=id){
//                         var comment_div = $('div.comment-div[value='+response.to_remove[remove_id]+']')
//                         if(comment_div.siblings('.comment-div').length==0){
//                             var parent_span = comment_div.parent().siblings('.inner-comments-span')
//                             parent_span.remove()
//                         }
//                         remove_span_if_no_comments(comment_div)
//                         comment_div.remove()
//                     }
//                 }
//             }
//             // update review comment count
//             comment_count.innerHTML=response.comment_count
//         }
//     })
// })

// // inherit done review
// // function to delete a review
// $(document).on('click', '.delete-review', function(event){
//     event.preventDefault()
//     var $button = $(this)
//     var single_review_bool=$button.attr('single_review')
//     var id = $button.attr('value')
//     var url = delete_review_url + id
//     $.ajax({
//         type:'POST',
//         url:url,
//         data:{
//             'csrfmiddlewaretoken': csrfToken
//         },
//         success: function(response){
//             new Promise(function(resolve){
//                 var parent = $button.closest('.review-container')
//                 parent.remove()
//                 // if currently on the single review page we redirect to the main page for the specific coffee
//                 if(single_review_bool=="True"){
//                     var href=document.getElementById('return-to-coffee').href
//                     console.log(href)
//                     window.location.href=href
//                 }
//                 resolve()
//             }).then(function(){
//                 //update stars for new rating
//                 const rating_count_element=document.getElementById('avg-rating-count')
//                 rating_count_element.innerHTML=parseFloat(rating_count_element.innerHTML)-1
//                 document.getElementById('avg_rating').setAttribute('value',getAverageRating())
                
//             }).then(function(){
//                 // set star ratings
//                 setAverageRating()
//             })
//         }
//     })
// })

// // inherit done - comments
// // function to remove the outer span if there is no comments to a review
// function remove_span_if_no_comments(element){
//     var comment_siblings = element.parent().siblings('.outer-comment-div')
//     if(comment_siblings.length==0){
//         var span_to_remove = element.parents().siblings('.outer-comments-span')
//         console.log(span_to_remove)
//         span_to_remove.remove()
//     }
// }

// // inherit done - comments
// function addShowHideComments(element){
//     var span_elements = Array.from(element.parentNode.children).filter(child => child.classList.contains("outer-comments-span"))
//     if (span_elements.length == 0){
//         var new_span = createElement('span', null, 'outer-comments-span', null, "Show comments...")
//         new_span.addEventListener("click", function(){
//             showOuterComments(this)
//         })
//         element.parentNode.insertBefore(new_span, element.nextSibling)
//         showOuterComments(new_span, true)
//     } else {
//         // display comments if span already exists
//         showOuterComments(span_elements[0], true)
//     }
// }

// // moved to comments - maybe need to inherit in review
// // function to create a new element with specified class names, ids, display types etc
// function createElement(tag, id = null, className = null, display = null, innerHTML = null, viewComment = null){
//     var element = document.createElement(tag)
//     if(id!=null){
//         element.id=id
//     }
//     if(className!=null){element.classList.add(...className.split(' '))}
//     if(display!=null){element.style.display=display}
//     if(innerHTML!=null){element.innerHTML=innerHTML}
//     if(viewComment!=null){
//         element.addEventListener("click", function(){
//             viewComments(this)
//         })
//     }
//     return element
// }

// // inherit done - comment
// function findNextTag(element, tag, className){
//     let sibling = element.nextElementSibling;
//     while(sibling){
//         if(sibling.tagName.toLowerCase()===tag.toLowerCase()){
//             if(sibling.classList.contains(className)){
//                 return sibling
//             }
//             return null
//         }
//         sibling = sibling.nextElementSibling
//     }
//     return null;
// }

// // function toggleDiv(element){
// //     var comment_div = element.parentNode.parentNode
// //     var replybox = comment_div.querySelector('.reply-box')
// //     if (replybox.style.display === "none") {
// //         replybox.style.display = "block";
// //     } else {
// //         replybox.style.display = "none";
// //     }
// // }

// // inherit done - comment
// function viewComments(element, override=false){
//     var hidden_comments = element.nextElementSibling
//     var next_div = hidden_comments.querySelector(".comment-div")
//     var next_span = hidden_comments.querySelector(".material-symbols-outlined")
//     if(next_span){
//         next_span.style.paddingLeft=next_div.style.marginLeft
//     }
//     if (hidden_comments.style.display === "none" || override==true) {
//         element.innerHTML="expand_less"
//         hidden_comments.style.display = "block";
//     } else {
//         element.innerHTML="expand_more"
//         hidden_comments.style.display = "none";
//     }
// }

// // inherit done - comments
// function showOuterComments(element, override=false){
//     var siblings = element.parentElement.children
//     var display
//     for (var i =0; i<siblings.length; i++){
//         if (siblings[i].classList.contains('outer-comment-div')){
//             display = getComputedStyle(siblings[i]).display
//             if(display == "none" || override==true){
//                 siblings[i].style.display = "block"
//                 element.innerHTML="Hide comments..."
//             } else {
//                 siblings[i].style.display = "none"
//                 element.innerHTML="Show comments..."
//             }
//         }
//     }
// }

// // function to display review form 
// // function showReviewForm(){
// //     var form = document.getElementById("review-form")
// //     var display = getComputedStyle(form).display
// //     if(display == "none"){
// //         form.style.display = "block"
// //     }else{
// //         form.style.display = "none"
// //     }
// // }

// // inherit done - edit forms
// //logic to open edit the comment or review window
// $(document).ready(function(){
//     $(document).on('click', '.edit-review-comment', function(){
//         var button = $(this)
//         var type=button.attr('type')
//         if(type=="comment"){
//             var div=button.closest('.comment-div')
//         } else{
//             var div=button.closest('.review-div')
//         }
//         div.find('#editCommentModal').modal('show');
//     })
// })

// // inherit
// //logic to capture form submission to edit comment or form
// $(document).on('submit', '.edit-form', function(event){
//     event.preventDefault()
//     sendEditRequest($(this))
// })

// // inherit
// // function to send post request for editing comment or review
// function sendEditRequest(button){
//     var form=button.closest('.edit-form')
//     var id=form.attr('record_id')
//     context={
//         'csrfmiddlewaretoken':csrfToken
//     }
//     type=form.attr('record_type')
//     context['type']=type
//     context['content']=form.find('#id_content').val()
//     if(type=="review"){
//         context["rating"] = form.find('#id_rating').val()
//     }
//     var url = edit_review+id

//     //send post request to django view
//     $.ajax(({
//         type:"POST",
//         url:url,
//         data:context,
//         success: function(response){
//             if(type=="comment"){
//                 var div = form.closest('.comment-div')   
//             } else {
//                 var div = form.closest('.review-div')
//             }
//             if(response.success){  
//                 var content=div.find('.content')[0]
//                 content.innerHTML=context['content']
//                 // if a review is being edited then update the rating and the coffees average rating
//                 if(context['type']=="review"){
//                     div.find('.main-ratings')[0].setAttribute('rating', context['rating'])
//                     updateStars()
//                     document.getElementById('avg_rating').setAttribute('value',getAverageRating())
//                     setAverageRating()  
//                 }
                
//             } else{
//                 alert("An error occured")
//             }
//             // close edit comment window
//             div.find('#editCommentModal').modal('hide')
//         }
//     }))
// }