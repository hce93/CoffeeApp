// function add_to_diary(diary_page=false){
$(document).ready(function(){
    $(document).on('click', '.add-diary', function(){
        var button = $(this)
        var id = button.attr('id')
        var already_added = button.attr('added')
        var accepted
        new Promise(function(resolve){
            if(already_added=="True"){
                accepted=confirm("You already have this coffee in your diary. Would you like to add another entry?")
            }else{
                accepted=confirm("Add item to you diary?")
            }
            resolve()
        }).then(function(){
            if(accepted){
                var url = diary_url + id
                $.ajax({
                    type:'POST',
                    url:url,
                    data:{
                        'csrfmiddlewaretoken': csrfToken
                    },
                    success: function(response){
                        if(response.success){
                            button.attr('title',"Add another entry to diary")
                        }
                        if(diary_page){
                            if(typeof re_run_table_bool!=="undefined"){
                                load_diary_request()
                            }
                            clearSearch()
                        }
                    }
                })
            }
        })
    })
})