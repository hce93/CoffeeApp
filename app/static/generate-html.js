function generateElementHTML(element, type, display_name=null, diary_entry=false){
    if(!diary_entry){
        var extra_fields_div=document.createElement('div')
        extra_fields_div.setAttribute('id', 'extra_fields')
    }
    // replace space with _ for use in attributes of tags        
    var element_no_space=element.toLowerCase().replace(/ /g, "_")
    var element_id_remove=element_no_space+"_remove"
    //create div holder
    const newDiv=document.createElement('div')
    if(diary_entry){
        newDiv.setAttribute('class', 'diary-input')
    }
    //create label tag
    const newLabel=document.createElement('label')
    newLabel.setAttribute('for', element_no_space)
    if (display_name){
        newLabel.innerHTML=display_name+": "
    }else{
        newLabel.innerHTML=element+": "
    }
    
    newDiv.appendChild(newLabel)
    //create input tag
    const newInput=document.createElement('input')
    newInput.setAttribute('type', type)
    newInput.setAttribute('id', element_no_space)
    newInput.setAttribute('name', element_no_space)
    //create remove button so user can undo changes
    const remove=document.createElement('span')
    remove.setAttribute('class', 'material-symbols-outlined')
    var element_id_remove=element_no_space
    remove.setAttribute('id', element_id_remove)
    
    if(diary_entry){
        remove.setAttribute('onclick', 'removeDiaryElement("'+element_id_remove+'")')
    }else{
        remove.setAttribute('onclick', 'removeElement("'+element_id_remove+'")')
    }
    remove.innerHTML="cancel"
    //append and return div
    newDiv.appendChild(newInput)
    newDiv.appendChild(remove)
    if(diary_entry){
        return newDiv
    }else{
        extra_fields_div.appendChild(newDiv)
        return extra_fields_div
    }
    //
}