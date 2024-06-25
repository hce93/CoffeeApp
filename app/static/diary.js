//variable to hold header names which cannot be edited
    //these are in the format in the database
var disable_editing_headers
//cleaned version of the above, used for display
var cleaned_disable_editing_headers;
//send GET request to load diary data when page first visited
document.addEventListener('DOMContentLoaded',function(){
    $.ajax({
        type:'GET',
        url:diary_url,
        success: function(response){
            var initialData=response.diary
            disable_editing_headers = response.headers_to_ignore
            console.log(response.headers)
            console.log(response.headers_to_ignore)
            //handontable function
            generateTable(initialData, disable_editing_headers)
        }
    })
})

//function to generate handsontable, referenced in event listener above
function generateTable(initialData, disable_editing_headers){
    const keys = generateUniqueKeys(initialData)
    const key_types=generateDataTypeForKeys(keys)
    cleaned_disable_editing_headers = generateColumnHeaders(disable_editing_headers, true)
    //generate column information
    var column_info = []
    var temp
    key_types.forEach(item=>{
        if(item[1]=="date"){
            temp={ data: item[0], type: item[1], dateFormat: item[2], correctFormat: item[3], readOnly:true }
        }else{
            temp={ data: item[0], type: item[1], readOnly:true }
        }
        //conditions to have title and roaster to start the table
        if(item[0]=="title"){
            column_info.splice(0,0,temp)
        }else if(item[0]=="roaster"){
            if(column_info.includes("Title")){
                column_info.splice(1,0,temp)
            }else{
                column_info.splice(1,0,temp)
            }
        }else{
            column_info.push(temp)
        }
        
    })

    const columns = generateColumnHeaders(column_info)
    const container = document.getElementById('handsontable-container');
    //variable to store a boolean for whether a cell is currently in edit mode
    var editStates={}
    const hot = new Handsontable(container, {
        data: initialData, // You can fill this with initial data if needed
        rowHeaders: true,
        contextMenu:  {
            items: {
              "row_details": {
                name: 'View Entry',
                callback: function(key, selection, clickEvent) {
                    var row = selection[0].start.row;
                    var rowData = hot.getDataAtRow(row);
                    var id = rowData[0]; // Assuming the ID is in the first column
                    getId(id).then(function(id){
                        window.location.href = `/diary/${id}`;
                    })
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
                }
              }
            }
        },
        manualColumnMove: true,
        manualColumnResize: true,
        columns: column_info,
        colHeaders: columns,
        columnSorting:true,
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
                console.log(cleaned_disable_editing_headers)
                if (cleaned_disable_editing_headers.includes(header)){
                    console.log(header)
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
            var title = row[0]
            var key_value_array={}
            for(let i =0;i<row.length;i++){
                if(row[i]!=null){
                    key_value_array[column_info[i]['data']]=row[i]
                }
                
            }
            saveChanges(changes[0], title)
        }
    })
    // render table to display the changes
    hot.render()
}

// send changes to django view to be committed to server
function saveChanges(changes, title){
    getId(title).then(function(id){
        $.ajax({
            type:'POST',
            url:edit_diary_url + id,
            data:{
                "changes":JSON.stringify(changes),
                "edit_from_table":true,
                "csrfmiddlewaretoken": csrfToken
            },
            success: function(response){
                console.log("Successsss")
            }
        })
    })
    
}

// returns the diary id for a given coffee title for this user
function getId(title){
    return new Promise(function(resolve){
        $.ajax({
            type:'GET',
            url:get_diary_id + title,
            success: function(response){
                resolve(response.id)
            }
        })
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
        if(item.includes("date")){
            data.add([item,"date","YYY-MM-DD", true])
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
    console.log(cleaned_keys)
    return Array.from(cleaned_keys)
}

