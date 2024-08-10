//event listener top add the ratings for each review once dom loaded
document.addEventListener('DOMContentLoaded',function(){
    updateStars()
    // if we're on a page with average ratings then run the below
    if(document.getElementById('avg_rating')!=null || document.getElementsByClassName('avg_ratings').length>0){
        console.log("found avgerage rating")
        setAverageRating()
    }
})

function updateStars(){
    var rating_holders = document.getElementsByClassName('rating-holder')
    for(var i=0; i<rating_holders.length;i++){
        // if the rating is for the edit window then we need to just update the colours and not generate the full html
        if(rating_holders[i].classList.contains('edit')){
            children = rating_holders[i].children       
            rating = parseInt(rating_holders[i].getAttribute('rating'))
            for(var x=0; x<children.length;x++){
                if(x<rating){
                    children[x].style.color="gray"
                }else{
                    children[x].style.color="#ddd"
                }
            }
            // generate html if not part of edit window
        }else{
            html=generateStars(rating_holders[i].getAttribute('rating'))  
            rating_holders[i].innerHTML=html  
        }
    }
}

function getAverageRating(){
    var rating_holders=document.getElementsByClassName('main-ratings')
    var rating_sum=0
    var rating_count=rating_holders.length
    console.log(rating_holders)
    for(var i=0; i<rating_count; i++){
        rating_sum+=parseFloat(rating_holders[i].getAttribute('rating'))
    }
    return rating_sum/rating_count
}

function setAverageRating(){
    var rating_holders = document.getElementsByClassName("avg_rating")==null
    if(document.getElementsByClassName('avg_ratings').length>0){
        rating_holders = Array.from(document.getElementsByClassName("avg_ratings"))
    }else{
        rating_holders = [document.getElementById("avg_rating")]
    }
    for(var x in rating_holders){
        console.log("Checking number: ", x)
        const stars = rating_holders[x].getElementsByClassName('avg_star')
        const rating = rating_holders[x].getAttribute('value')
        const floor = Math.floor(rating)
        for(var x=0; x<stars.length; x++){
            if(x<floor){
                stars[x].style.setProperty('--percent', `100%`)
                stars[x].style.color="gray"
            }else{
                stars[x].style.setProperty('--percent', `0%`)
                stars[x].style.color="#ddd"
            }
        }
        // check if there is a fraction of a star to fill, and reviews (and therefore ratings) exist for this coffee
        if(rating %1!=0 &  rating!="NaN" ){
            console.log(stars)
            stars[floor].classList.add('partial')
            stars[floor].style.setProperty('--percent', `${(rating%1)*100}%`)
            stars[floor].style.color="gray"
        }
    }
    // const star_div = document.getElementById("avg_rating")

}

// function to generate html for review ratings
function generateStars(rating, edit=false){
    html=``
    if(edit){
        // modify existing element if we allow editing so the hover functions etc from the dom will work

        filled_template = `<span class="new_star" style="color: gra;"></span>`
        empty_template = `<span class="new_star" style="color: #ddd;"></span>`
    }else{
        filled_template = `<span class="avg_star" style="color: gray;"></span>`
        empty_template = `<span class="avg_star" style="color: #ddd;"></span>`
    }
    
    for(var i = 1; i<=5; i++){
        if(i<=rating){
            html+=filled_template
        } else {
            html+=empty_template
        }
    }
    return html
}

// function to change star colour as the user hovers over them
$('.new_star').hover(function(){
    var icon = $(this)
    var prior_siblings = icon.prevAll()
    if(icon.parent()[0].classList.contains('selected')){
        //
    }else{
        icon.css("color","gray")
        prior_siblings.css("color","gray")
    }
    },function(){
        // This function will execute when mouse leaves the element
        var icon = $(this);
        var prior_siblings = icon.prevAll();
        if(icon.parent()[0].classList.contains('selected')){
            //
        }else{
            prior_siblings.css("color","#ddd"); 
            icon.css("color","#ddd")
        }   
    })

    // function to maintain colur of stars when user selects the rating
// if user selects a new rating this function will adjust colours
$(document).on('click', '.new_star', function(){
    var icon = $(this)
    var prior_siblings = icon.prevAll()
    var next_siblings = icon.nextAll()

    icon.css("color","gray")
    prior_siblings.css("color","gray")
    next_siblings.css("color","#ddd")

    icon.parent().addClass('selected')
    icon.parent().siblings('#id_rating').val(icon.attr('value'))
})