//0 = No changes
//1 = Modify
//2 = Create
//3 = delete

var set_id;
var index;

//TODO add function to check if card has been changed

$(document).ready(async function() {
    set_id = $("#flashcards").attr("set_id");
    index = $(".flashcard-group").length - 1
})

$(".delete-flash").on("click", function() { 
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

$("#submit").on("click", function() {
    var flashcards = $(".flashcard-group")
    
    //card_id, card_front, card_back
    var changed = [];

    //card_id
    var deleted = [];

    //card_front,card_back
    var created = [];

    for(var i = 0; i < flashcards.length - 1; i++) {
        //modify
        if($(flashcards[i]).attr("value") == "1") {
            var temp = {};
            temp.card_id = $(flashcards[i]).attr("card_id");
            temp.card_front = $(flashcards[i]).find(".term-input")[0].innerHTML;
            temp.card_back = $(flashcards[i]).find(".def-input")[0].innerHTML;
            changed.push(temp);
        }

        //create
        else if($(flashcards[i]).attr("value") == "2") {
            var temp = {};
            temp.card_front = $(flashcards[i]).find(".term-input")[0].innerHTML;
            temp.card_back = $(flashcards[i]).find(".def-input")[0].innerHTML;
            created.push(temp)
        }

        //delete
        else if($(flashcards[i]).attr("value") == "3") {
            deleted.push($(flashcards[i]).attr("card_id"));
        }
    }

    //TODO check for invalid inputs

    var payload = {cardchanged:changed, deleted:deleted, created: created}
    payload.title = $("#title").attr("value")
    payload.description = $("#description").attr("value")

    console.log(payload)

    //TODO ajax
})