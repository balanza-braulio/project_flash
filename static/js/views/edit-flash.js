//0 = No changes
//1 = Modify
//2 = Create
//3 = delete

var set_id;
var index;

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

$(".flash-input").on("change", function() { 
    $(this).unbind()

    $(this.parentNode.parentNode).attr("value", "1")
})

$("#add-flash").on("click", function() {
    index++;
    var flash = $("#template").clone(true);
    
    flash.removeAttr("id")
    flash.find(".index")[0].innerHTML = `${index}.`
    flash.removeAttr("hidden")
    $("#flashcards").append(flash)
    flash.find(".flash-input").unbind()
})

$("#submit").on("click", function() {
    var flashcards = $(".flashcard-group");
    var errors = [];
    
    var title = $("#title").val().trim()
    var description = $("#description").val().trim();

    //remove all alerts
    $(".alert-area").empty();

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
            temp.card_front = $(flashcards[i]).find(".term-input").val().trim();
            temp.card_back = $(flashcards[i]).find(".def-input").val().trim();
            changed.push(temp);

            if(temp.card_back == "" || temp.card_front == "") {
                errors.push("Card can't be empty from front or back");
                break;
            }
        }

        //create
        else if($(flashcards[i]).attr("value") == "2") {
            var temp = {};
            temp.card_front = $(flashcards[i]).find(".term-input").val().trim();
            temp.card_back = $(flashcards[i]).find(".def-input").val().trim();
            temp.cardSet_id = set_id;
            created.push(temp)

            if(temp.card_back == "" || temp.card_front == "") {
                errors.push("Card can't be empty from front or back");
                break;
            }
        }

        //delete
        else if($(flashcards[i]).attr("value") == "3") {
            deleted.push($(flashcards[i]).attr("card_id"));
        }
    }

    if(title.length == 0) {
        errors.push("Title can not be empty!")
    }

    if(index - deleted.length < 2){
        errors.push("Card set must have at least two cards")
    }

    if(errors.length > 0) {
        for(var x of errors)
        {   
            var temp = $("#alert-template").clone();
            temp.removeAttr("id");
            temp.removeAttr("hidden")
            temp[0].innerHTML = x;

            $(".alert-area").append(temp);
        }

        return
    }

    var payload = {
        cardSet_id: set_id,
        title: title, 
        description: description, 
        change: changed, 
        destroy: deleted, 
        create: created
    }

    $.ajax({
        type: "PATCH",
        url: "/api/editset",
        data: payload
    }).then((id) => {
        window.location.replace(`/cardSet/${set_id}`);
    });
})