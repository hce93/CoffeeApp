// create additions variabl to track what new elements user adds and prevent duplicates
var additions=[]
//function to post form submission to django view
$(document).ready(function() {
    $('#diary-form').on('submit', function(event) {
        event.preventDefault();
        var slug = $(this).attr('value')
        url = edit_diary_url
        url = url + slug
        const formData =new FormData(this)
        var content={}
        for (let [key, value] of formData.entries()) {
            content[key]=value
        }
        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(content)
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/diary';
            } else {
                console.error('No redirect URL found in response.');
            }
        })
        .catch(error => console.error('Fetch error:', error));
    })
})
// function to add diary element to users diary. User can then edit the content of this later
    //if element is null then it is a manually entered element by th euser
    // otherwise it is a suggestion
function addDiaryElement(element=null){
    console.log("Current additions: ", additions)
    event.preventDefault()
    var element_type
    var element_display_name=null
    var manual_entry=true
    //if below the user has added a suggested/generic diary element
    if(element){
        manual_entry=false
        element_type=document.querySelector("span#"+element).getAttribute('data_type')
        element_display_name=element.replace("_", " ")
        element_display_name=element_display_name.charAt(0).toUpperCase()+element_display_name.slice(1)
        var form = document.querySelector("form#"+element)
        form.remove()
    //otherwise the user is adding a personal/bespoke diary element
    }else{
        element = document.getElementById('diary-element').value        
        //test if element is formatted
        const test_element_format = /^[a-zA-Z0-9\s]+$/.test(element)
        if (test_element_format){
            element_type = document.getElementById('diary-element-type').value 
        } else {
            alert("Please only enter characters or numbers")
            return
        }

    }
    //check if element has been used already
    // need to adjust the below to not run the checkElementUsed if it is from a suggestion
    checkElementUsed(element, manual_entry).then(data=>{
        if(data){
            //check for duplication of elements
            formatted_element=element.toLowerCase().replace(" ","_")
            if(additions.includes(formatted_element)){
                alert(element + " has already been added!")
            } else{
                var diary_form = document.getElementById('diary-form-input-div')
                var html=generateElementHTML(element, element_type, element_display_name, true)
                diary_form.appendChild(html)

                var remove = document.getElementById('to_remove')
                if(remove){
                    remove.remove()
                }
                additions.push(formatted_element)
            }
            document.getElementById('diary-element').value=""
        } else{
            alert("Diary already contains: " + element)
        }  
    })

}

//function to check if a maunally entered diary label already exists
function checkElementUsed(element, manual_entry){
    // want to check if the user is adding a suggestion or not. 
        // Check if user is manually typing an element?
    
    var diary_id=document.getElementById('diary-form').getAttribute('value')
    console.log(diary_id)
    url = check_diary_header_url
    content={
        "element":element,
        "id":diary_id
    }
    return fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
    }).then(response => response.json())
    .then(data => {
        if(!manual_entry){
            return true
        }else{
            return data.success
        }
    })
    .catch(error => console.error('Fetch error:', error));
}

// function generateDiaryHTML(element, type, display_name=null){
//     // replace space with _ for use in attributes of tags        
//     var element_no_space=element.toLowerCase().replace(/ /g, "_")
//     var element_id_remove=element_no_space+"_remove"
//     //create div holder
//     const newDiv=document.createElement('div')
//     newDiv.setAttribute('class', 'diary-input')  //
//     //create label tag
//     const newLabel=document.createElement('label')
//     newLabel.setAttribute('for', element_no_space)
//     if (display_name){
//         newLabel.innerHTML=display_name+": "
//     }else{
//         newLabel.innerHTML=element+": "
//     }
    
//     newDiv.appendChild(newLabel)
//     //create input tag
//     const newInput=document.createElement('input')
//     newInput.setAttribute('type', type)
//     newInput.setAttribute('id', element_no_space)
//     newInput.setAttribute('name', element_no_space)
//     //create remove button so user can undo changes
//     const remove=document.createElement('span')
//     remove.setAttribute('class', 'material-symbols-outlined')
//     var element_id_remove=element_no_space+"_remove"
//     remove.setAttribute('id', element_id_remove)
    
//     remove.setAttribute('onclick', 'removeDiaryElement("'+element_id_remove+'")')//
//     remove.innerHTML="cancel"
//     //append and return div
//     newDiv.appendChild(newInput)
//     newDiv.appendChild(remove)
//     return newDiv
//     //
// }

// function generateElementHTML(element, type, display_name=null, diary_entry=false){
//     if(!diary_entry){
//         var extra_fields_div=document.createElement('div')
//         extra_fields_div.setAttribute('id', 'extra_fields')
//     }
//     // replace space with _ for use in attributes of tags        
//     var element_no_space=element.toLowerCase().replace(/ /g, "_")
//     var element_id_remove=element_no_space+"_remove"
//     //create div holder
//     const newDiv=document.createElement('div')
//     if(diary_entry){
//         newDiv.setAttribute('class', 'diary-input')
//     }
//     //create label tag
//     const newLabel=document.createElement('label')
//     newLabel.setAttribute('for', element_no_space)
//     if (display_name){
//         newLabel.innerHTML=display_name+": "
//     }else{
//         newLabel.innerHTML=element+": "
//     }
    
//     newDiv.appendChild(newLabel)
//     //create input tag
//     const newInput=document.createElement('input')
//     newInput.setAttribute('type', type)
//     newInput.setAttribute('id', element_no_space)
//     newInput.setAttribute('name', element_no_space)
//     //create remove button so user can undo changes
//     const remove=document.createElement('span')
//     remove.setAttribute('class', 'material-symbols-outlined')
//     var element_id_remove=element_no_space
//     remove.setAttribute('id', element_id_remove)
    
//     if(diary_entry){
//         remove.setAttribute('onclick', 'removeDiaryElement("'+element_id_remove+'")')
//     }else{
//         remove.setAttribute('onclick', 'removeElement("'+element_id_remove+'")')
//     }
//     remove.innerHTML="cancel"
//     //append and return div
//     newDiv.appendChild(newInput)
//     newDiv.appendChild(remove)
//     if(diary_entry){
//         return newDiv
//     }else{
//         extra_fields_div.appendChild(newDiv)
//         return extra_fields_div
//     }
//     //
// }

function removeDiaryElement(element){
    event.preventDefault()
    console.log("Checking suggestions for ", element)
    generateSuggestions(element)
    var parent_div
    var message
    var remove_element
    var parent

    new Promise(function(resolve){

        remove_element = document.getElementById(element)
        parent = remove_element.parentNode
        console.log("input: ", parent)
        parent.remove()
        resolve()
    }).then(function(){
        //check if no elements in diary and display message if so
        parent_div = document.getElementById('diary-form-input-div')
        console.log("Parent: ", parent_div)
        if(parent_div.children.length==0){
            message=document.createElement('p')
            message.setAttribute('id', 'to_remove')
            message.innerHTML="You have no diary entries for this coffee"
            parent_div.appendChild(message)
        }
    })

}

function generateSuggestions(element_removed){

    var element=document.getElementById(element_removed)
    console.log(element)
    //use id of previous element (which is the input element) as this has true id
        //id from button has _remove at end 
    element_to_check=element.id
    console.log("Checking sugestions for: ", element_to_check)
    var elements_to_include={"roast_date":"date", "open_date":"date", "brew_method":"text",
    "grinder":"text", "grinder_setting":"text", "flavour_notes":"text"}
    console.log("printing element again: ", element)
    console.log("Additions: ", additions)
    keys = Object.keys(elements_to_include)
    console.log("Keys: ", keys)
    if(keys.includes(element_to_check)){
        //generate a new element
        var form = document.createElement('form')
        form.setAttribute('id', element_to_check)
        var span = document.createElement('span')
        span.setAttribute('id', element_to_check)
        span.setAttribute('data_type', elements_to_include[element_to_check])
        //generate display test
        var element_display = element_to_check.replace("_", " ")
        element_display=element_display.charAt(0).toUpperCase() + element_display.slice(1)
        span.innerHTML=element_display
        var button = document.createElement('button')
        button.setAttribute('onclick', 'addDiaryElement("'+element_to_check+'")')
        button.innerHTML="Add"
        form.appendChild(span)
        form.appendChild(button)
        var suggested_elements_div=document.getElementById('suggested-elements')
        suggested_elements_div.appendChild(form)
        additions.pop(element_to_check)
    }

    
}
