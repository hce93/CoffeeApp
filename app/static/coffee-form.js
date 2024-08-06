function addElement(){
    event.preventDefault()
    var type;
    var display_name;
    var server_name;
    var form=document.getElementById('coffee-form-input-div')

    display_name=document.getElementById('coffee-element').value
    const test_format = /^[a-zA-Z0-9\s]+$/.test(display_name)
        if (test_format){
            type = document.getElementById('coffee-element-type').value 
        } else {
            alert("Please only enter characters or numbers")
            return
        }
    
    // generate html
    var html = generateElementHTML(display_name, type)
    form.appendChild(html)

    // remove text from input form
    document.getElementById('coffee-element').value=""
}

// function generateElementHTML(element, type, display_name=null){
//     var extra_fields_div=document.createElement('div')
//     extra_fields_div.setAttribute('id', 'extra_fields')
//     // replace space with _ for use in attributes of tags        
//     var element_no_space=element.toLowerCase().replace(/ /g, "_")
//     var element_id_remove=element_no_space+"_remove"
//     //create div holder
//     const newDiv=document.createElement('div')
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
    
//     remove.setAttribute('onclick', 'removeElement("'+element_id_remove+'")')
//     remove.innerHTML="cancel"
//     //append and return div
//     newDiv.appendChild(newInput)
//     newDiv.appendChild(remove)
//     extra_fields_div.appendChild(newDiv)
//     return extra_fields_div
//     //
// }

function removeElement(element){
    event.preventDefault()
    var parent_div
    var message
    var remove_element
    var parent
    remove_element = document.getElementById(element)
    parent = remove_element.parentNode
    console.log("input: ", parent)
    parent.remove()
}