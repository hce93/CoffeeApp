document.addEventListener('DOMContentLoaded', function () {
    truncateText()
    
});

function truncateText(){
    const reviews = document.getElementsByClassName('review-content');
    console.log("ALL REVIEWS: ", reviews)
    const maxLength = 200;
    
    for(let index=0; index<reviews.length;index++){
        let originalText = reviews[index].textContent;
        console.log("TEXT: ", originalText.length)
        if (originalText.length > maxLength) {
            let truncatedText = originalText.slice(0, maxLength);
            truncatedText = truncatedText.slice(0, truncatedText.lastIndexOf(" ")) + '...';
            console.log("Truncated: ", truncatedText)
            reviews[index].textContent = truncatedText;
        }
    }
}