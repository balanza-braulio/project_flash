//0 = No changes
//1 = Modify
//2 = Create
//3 = delete

var set_id;
var changed = [];
var deleted = [];
var index

$(document).ready(async function() {
    set_id = $("#flashcards").attr("set_id");
    index = $(".flashcard-group").length - 1
})

$(".delete-flash").on("click", function() { 
    console.log("delete")

    var parent = $(this.parentElement);

    if(parent.attr("value") == "2"){
        this.parentNode.remove()
        
        index--;
        var flash = $(".flashcard-group")
        for(var i = 0; i < index; i++) {
            flash.find(".index")[i].innerHTML = `${i+1}.`
        }
    }
    
    else if(parent.attr("value") == "0" || parent.attr("value") == "1") {
        parent.attr("value", 3)
        parent.find(".term-input").attr("disabled", "");
        parent.find(".def-input").attr("disabled", "");
    }

    else if(this.parentNode.attributes.value.value == "3") {
        parent.attr("value", 1)
        parent.find(".term-input").removeAttr("disabled")
        parent.find(".def-input").removeAttr("disabled")
    }
})

$("#add-flash").on("click", function() {
    index++;
    var flash = $("#template").clone(true);
    
    flash.removeAttr("id")
    flash.find(".index")[0].innerHTML = `${index}.`
    flash.removeAttr("hidden")
    $("#flashcards").append(flash)
})