document.addEventListener('DOMContentLoaded', function () {
    var maxLength = 200;
    if(window.location.pathname=="/"){
        maxLength=50
    }
    truncateText(maxLength)
    
});

function truncateText(maxLength){
    const reviews = document.getElementsByClassName('review-content');
    
    for(let index=0; index<reviews.length;index++){
        let originalText = reviews[index].innerHTML;
        console.log("TEXT: ", originalText.length)
        if (originalText.length > maxLength) {
            let truncatedText = originalText.slice(0, maxLength);
            truncatedText = truncatedText.slice(0, truncatedText.lastIndexOf(" ")) + '...';
            truncatedText=truncatedText.split('\n').map(line=>`<p>${line}</p>`).join('')
            reviews[index].innerHTML = truncatedText;
        }
    }
}