//variable to hold header names which cannot be edited
    //these are in the format in the database
var disable_editing_headers
//cleaned version of the above, used for display
var cleaned_disable_editing_headers;
//event listener to run function when dom loaded
document.addEventListener('DOMContentLoaded',function(){
    load_diary_request()
})
// function to send GET request for diary data then load handsontable
function load_diary_request(){
    // check if the table is already created and remove if it is
        // this is in case we need to reload the tbale with new data
    const table_div = document.getElementById('handsontable-container')
    if(table_div.hasChildNodes()){
        table_div.innerHTML=""
    }
    $.ajax({
        type:'GET',
        url:generate_diary_url,
        success: function(response){
            var initialData=response.diary
            disable_editing_headers = response.headers_to_ignore
            //handontable function
            if(initialData.length==0){
                var element = document.createElement('p')
                element.innerHTML="You have nothing in your diary..."
                var container = document.getElementById('handsontable-container')
                container.appendChild(element)
                document.getElementsByClassName('asterisk')[0].style.display="none"
                document.getElementsByClassName('controls-container')[0].style.display="none"
            }else{
                generateTable(initialData, disable_editing_headers, response.coffee_headers)
            }
        }
    })
}

//function to generate handsontable, referenced in event listener above
function generateTable(initialData, disable_editing_headers, coffee_headers){
    const keys = generateUniqueKeys(initialData)
    const key_types=generateDataTypeForKeys(keys)
    cleaned_disable_editing_headers = generateColumnHeaders(disable_editing_headers, true)
    //generate column information
    var column_info = []
    var last_update
    var temp
    var coffee_items=[]
    key_types.forEach(item=>{
        if(item[1]=="date"){
            if(item[0]=="last_update"){
                temp={data: item[0], type: item[1], dateFormat: item[2], correctFormat: item[3], readOnly:true, columnSorting:{comparator:function(a,b){
                    return new Date(a.replace(" : ", "T")) - new Date(b.replace(" : ", "T"))}}
                }
            }else{
                temp={data: item[0], type: item[1], dateFormat: item[2], correctFormat: item[3], readOnly:true}
            }
        }else{
            temp={ data: item[0], type: item[1], readOnly:true }
        }
        //conditions to have title and roaster to start the table
        if(item[0]=="title"){
            column_info.splice(0,0,temp)
        }else if(item[0]=="roaster"){
            if(column_info.includes("title")){
                column_info.splice(0,0,temp)
            }else{
                column_info.splice(1,0,temp)
            }
            // save last_update in a seperate variable so we can push it to the end of the table
        }else if(item[0]=="last_update"){
            last_update=temp
        }else if(coffee_headers.includes(item[0])){
            console.log("We have a coffee item")
            coffee_items.push(temp)
        }else{
            column_info.push(temp)
        }
    })
    column_info.splice(2,0,...coffee_items)
    // add last_update to the end of the table
    column_info.push(last_update)
    const columns = generateColumnHeaders(column_info)
    const container = document.getElementById('handsontable-container');

    // listener for search function
    const searchField = document.querySelector('#search_field');
    document.getElementsByClassName('asterisk')[0].style.display="inline"
    document.getElementsByClassName('controls-container')[0].style.display="inline"
    const output = document.querySelector('#output');
    searchField.addEventListener('keyup', (event) => {
        var searchResultCount=0
        var rowArray = [...Array(hot.countRows()).keys()]
        const hide_plugin=hot.getPlugin('hiddenRows');
        const search = hot.getPlugin('search');
        const queryResult = search.query(event.target.value);
        if(event.target.value==""){
            // if no search is entered hsow all the rows
            hide_plugin.showRows(rowArray)
        }else{
            // create an array of rows to keep according to search
            to_keep = []
            for(var item in queryResult){
                // check if query returned the hidden id field. if it did ignore this and remove from array
                if(queryResult[item]['col']==columns.indexOf(' id')){
                    queryResult.splice(item,1)
                } else {
                    to_keep.push(queryResult[item]['row'])
                }
            }
            // filter out rows to keep and hide the rest
            hide_plugin.hideRows(rowArray.filter(x=>to_keep.indexOf(x)===-1))
            hide_plugin.showRows(rowArray.filter(x=>to_keep.indexOf(x)>-1))
        }
        // update count
        searchResultCount=queryResult.length
        output.innerText=`${searchResultCount} results`
        // render table
        hot.render();
    });
    console.log("DATA: ", initialData)
    //variable to store a boolean for whether a cell is currently in edit mode
    var editStates={}
    const hot = new Handsontable(container, {
        data: initialData, // You can fill this with initial data if needed
        rowHeaders: true,
        search: {
            searchResultClass:'customSearchResultClass'
        },
        contextMenu:  {
            items: {
              "row_details": {
                name: 'Edit Entry/Add Items',
                callback: function(key, selection, clickEvent) {
                    var row = selection[0].start.row;
                    var id =hot.getDataAtRow(row)[columns.indexOf(' id')];
                    window.location.href = `/diary/${id}`
                }
              },
              "row_details2": {
                name: function() {
                    var row = hot.getSelectedRangeLast().to.row;
                    var col = hot.getSelectedRangeLast().to.col;
                    var cellKey = `${row},${col}`;
                    return editStates[cellKey]? 'Finish Editing':'Edit Cell';
                },
                callback: function(key, selection, clickEvent) {
                    var row = selection[0].start.row;
                    var col = selection[0].start.col;
                    var cellProperties = hot.getCellMeta(row, col);
                    cellProperties.readOnly = !cellProperties.readOnly;
                    //update cellKey so we can track what name to display in menu
                    var cellKey = `${row},${col}`;
                    if(editStates[cellKey]==null){
                        editStates[cellKey]=true
                    }else{
                        editStates[cellKey]=!editStates[cellKey]
                    }
                    hot.render();
                },
                hidden: function (key, options) {
                    // don't show edit option if it is within disabled editing list
                    var col_indx=hot.getSelectedRangeLast().to.col
                    col_name=hot.getColHeader(col_indx)
                    return cleaned_disable_editing_headers.includes(col_name)
                }
              },
              "remove_row":{
                name:"Delete Entry",
                callback: function(key, selection, clickEvent){
                    // get id from row to be deleted
                    var row = selection[0].start.row;
                    var id=hot.getDataAtRow(row)[columns.indexOf(' id')]
                    // send ajax request to delete the entry from mongodb
                    $.ajax({
                        type:"GET",
                        url:delete_diary_entry+id,
                        success: function(response){
                            if(response.success){
                            hot.alter('remove_row', row)
                            // if table is empty then hide it
                            if(hot.countRows()==0){
                                document.getElementById('handsontable-container').innerHTML=""
                                var element = document.createElement('p')
                                element.innerHTML="You have nothing in your diary..."
                                document.getElementById('handsontable-container').appendChild(element)
                                document.getElementsByClassName('asterisk')[0].style.display="none"
                                document.getElementsByClassName('controls-container')[0].style.display="none"
                            }
                            }else{
                                alert("An error occured, unable to delete entry")
                            }
                        }
                    })  
                }
              },
              "view_coffee":{
                name:"View Coffee",
                callback:function(key, selection, clickEvent){
                    var row = selection[0].start.row;
                    var id=hot.getDataAtRow(row)[columns.indexOf(' id')]
                    $.ajax({
                        type:"GET",
                        url:get_coffee_from_diary+id,
                        success: function(response){
                            if(response.success){
                            window.location.href=`/coffee/${response.slug}`
                            }else{
                                alert("An error occured. Unable to redirect")
                            }
                        }
                    })
                }
              },
              "write_review":{
                name:"Write a Review for the Coffee",
                callback:function(key, selection, clickEvent){
                    var row = selection[0].start.row;
                    var id=hot.getDataAtRow(row)[columns.indexOf(' id')]
                    $('#editCommentModal').modal('show');
                    // add diary id to form element so we can use this to send to the django view when form is submitted
                    $('.edit-form').attr('diary_id', id)
                }
              }
            }
        },
        manualColumnMove: true,
        manualColumnResize: true,
        columns: column_info,
        colHeaders: columns,
        columnSorting:true,
        hiddenColumns: {
            // hide the id column            
            columns:[columns.indexOf(' id')],
            indicators:false
        },
        hiddenRows:{},
        dropdownMenu: [
            'filter_by_condition',
            'filter_by_value',
            'filter_action_bar',
        ],
        filters: true,
        licenseKey: 'non-commercial-and-evaluation',
    });

    //function to grey out colmns which cannot be edited
        // these are columns which are linnked to the coffee entry in the db and not the diary entry 
    hot.updateSettings({
        cells:function(row, col){
            if (row === 0) {
                var header = hot.getColHeader(col)
                if (cleaned_disable_editing_headers.includes(header)){
                    var col_length = hot.getDataAtCol(col).length
                    for(var i=0;i<col_length;i++){
                        hot.setCellMeta(i, col, 'className', 'grey')
                    }        
                }
            }       
        },
    })

    //function to store changes and pass to savaChanges function which sends to django view
    hot.addHook('afterChange', function(changes, source){
        if(source=='edit'){
            var row = hot.getDataAtRow(changes[0][0])
            // var title = row[0]
            var id=hot.getDataAtRow(changes[0][0])[columns.indexOf(' id')];
            var key_value_array={}
            for(let i =0;i<row.length;i++){
                if(row[i]!=null){
                    key_value_array[column_info[i]['data']]=row[i]
                }   
            }
            saveChanges(changes[0], id)
        }
    })
    // render table to display the changes
    hot.render()
}

// send changes to django view to be committed to server
function saveChanges(changes, id){
    $.ajax({
        type:'POST',
        url:edit_diary_url + id,
        data:{
            "changes":JSON.stringify(changes),
            "edit_from_table":true,
            "csrfmiddlewaretoken": csrfToken
        },
        success: function(response){
            console.log("Success")
        }
    })
}

function generateUniqueKeys(data){
    const unique_keys = new Set()
    data.forEach(item=>{
        Object.keys(item).forEach(key=>{
            unique_keys.add(key)
        })
    })
    return Array.from(unique_keys)
}

function generateDataTypeForKeys(keys){
    const data = new Set()
    keys.forEach(item=>{
        if(item=="last_update"){
            data.add([item, "date", "YYYY-MM-DDTHH:mm:ss.sssZ", true])
        }else if(item.includes("date")){
            data.add([item,"date","YYYY-MM-DD", true])
        } else{
            data.add([item, "text"])
        }
    })
    return Array.from(data)
}

//function to clean column headers by removing "_", replacing with " " etc.
function generateColumnHeaders(keys, disabled_keys=false){
    const cleaned_keys = new Set()
    var temp

    keys.forEach(key=>{
        if(disabled_keys){
            temp = key.replace("_"," ")
        }else{
            temp = key['data'].replace(/_/g, " ")
        }
        temp = temp.charAt(0).toUpperCase() + temp.slice(1)
        cleaned_keys.add(temp)
    })
    return Array.from(cleaned_keys)
}

$(document).on('submit', '.edit-form', function(event){
    event.preventDefault()
    sendNewReview($(this))
})
function sendNewReview(button){
    var form=button.closest('.edit-form')
    var diary_id=form.attr('diary_id')
    var content=form.find('#id_content').val()
    var rating = form.find('#id_rating').val()
    var url = review_from_diary+diary_id

    //send post request to django view
    $.ajax(({
        type:"POST",
        url:url,
        data:{
            'csrfmiddlewaretoken':csrfToken,
            'content':content,
            'rating':rating,
        },
        success: function(response){
            if(response.success){
                alert("Review submitted successfully")
                // clear the review box
                form.find('#id_content').val('')
                form.find('#id_rating').val('')
                form.find('#star-rating').removeClass('selected')
                form.find('.new_star').css('color', '#ddd')

                // close edit comment window
                $('#editCommentModal').modal('hide')
            }
        }
    }))
}

// add search functionality
const search_form = document.getElementById('search-form')
search_form.addEventListener('submit', function(){
    event.preventDefault()
    var search = search_form.querySelector('input').value
    if(search==""){
        // if search nothing then remove
    }else{
        $.ajax(({
            type:"POST",
            url:all_coffee,
            data:{
                'csrfmiddlewaretoken':csrfToken,
                'search':search,
                'diary_search':true,
            },
            success: function(response){
                if(response.success){
                    var search_div = document.getElementById('coffee_search')
                    search_div.innerHTML=response.html 
                    search_div.style.display="flex"
                    generateNextPreviousButtons(response.current_page, response.total_pages)
                }
                setAverageRating()
                
            }
        }))
    }
})

// function to clear the search bar and the search results
    // used when an item from the search is added ot the diary
function clearSearch(){
    document.getElementById('search-form').querySelector('input').value=""
    document.getElementById('coffee_search').innerHTML=""
    document.getElementById('coffee_search').style.display="none"
    document.getElementById('pagination_previous_holder').innerHTML=""
    document.getElementById('pagination_next_holder').innerHTML=""
    document.getElementById('pagination_text').innerHTML=""
}

function diaryChangePage(element, change){
    const current_page=element.getAttribute('current_page')
    const search =document.getElementById('search-form').querySelector('input').value

    $.ajax(({
        type:"POST",
        url:all_coffee,
        data:{
            'csrfmiddlewaretoken':csrfToken,
            'search':search,
            'diary_search':true,
            'page':parseInt(current_page)+change
        },
        success:function(response){
            var search_div = document.getElementById('coffee_search')
            search_div.innerHTML=response.html 
            generateNextPreviousButtons(parseInt(response.current_page), parseInt(response.total_pages))
            setAverageRating()
        }
    }))
}
// function to update next and previous page links in the search box
function generateNextPreviousButtons(current_page, total_pages){
    // add text for current page
    document.getElementById('pagination_text').innerHTML="Page " + current_page + " of " + total_pages
    // check if previous button is needed
    if(current_page>1){
        // check if previous button exists
        if(document.getElementById('previous_page')){
            // if it does update the current page attribute
            var previous_element=document.getElementById('previous_page')
            previous_element.setAttribute('current_page', current_page)
        // if it doesnt exist add a new button
        }else{
            var previous_element=`<a onclick="diaryChangePage(this,-1)" id="previous_page" current_page=`+current_page+`><span class="material-symbols-outlined">keyboard_arrow_left</span></a>`
            document.getElementById('pagination_previous_holder').innerHTML=previous_element   
        }   
    }
    if(current_page<total_pages){
        if(document.getElementById('next_page')){
            var previous_element=document.getElementById('next_page')
            previous_element.setAttribute('current_page', current_page)
        }else{
            var next_element=`<a onclick="diaryChangePage(this,1)" id="next_page" current_page=`+current_page+`><span class="material-symbols-outlined">keyboard_arrow_right</span></a>`
            document.getElementById('pagination_next_holder').innerHTML=next_element
        }
        if(!document.getElementById('last_page')){
            var x = total_pages-1    
            var last_element=`<a onclick="diaryChangePage(this,1)" id="last_page" current_page="`+x+`"><span class="material-symbols-outlined">last_page</span></a>`
            last_element=document.getElementById('pagination_next_holder').innerHTML+last_element
            document.getElementById('pagination_next_holder').innerHTML=last_element   
        }
    }
    if(current_page>2){
        if(!document.getElementById('first_page')){
            var first_element=`<a onclick="diaryChangePage(this,-1)" id="first_page" current_page="2"><span class="material-symbols-outlined">first_page</span></a>`
            first_element+=document.getElementById('pagination_previous_holder').innerHTML
            document.getElementById('pagination_previous_holder').innerHTML=first_element
        }
    }
    

    // remove previous/next icons if not needed
    if(current_page>=(total_pages-1)){
        if(document.getElementById('last_page')){
            document.getElementById('last_page').remove()
        }
        if(current_page==total_pages){
            if(document.getElementById('next_page')){
                document.getElementById('next_page').remove()
            }
            
        }
    }else if(current_page <= 2){
        if(document.getElementById('first_page')){
            document.getElementById('first_page').remove()
        }
        if(current_page==1){
            if(document.getElementById('previous_page')){
                document.getElementById('previous_page').remove()
            }
        } 
    }
}

// function to reset the search
document.getElementById('reset_button').addEventListener('click', function(){
    clearSearch()
})

