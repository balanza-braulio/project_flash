$(document).ready(async function() { 
    //retriveData("/templates/cards.handlebars", "#CarouselContent", `/api/cardSet/${$("#set").attr("value")}`)

    var list = await $.ajax({
        datatype: "json",
        url: `/api/cardSet/${$("#set").attr("value")}`
    })

    list = list.Cards

    for(var i = 0; i < list.length; i++) { 
        var temp = $("#template").clone()

        temp.find("#front")[0].innerHTML = list[i].card_front
        temp.find("#back")[0].innerHTML = list[i].card_back
        temp[0].removeAttribute("hidden")
        temp[0].removeAttribute("id")

        if(i == 0) {
            temp.attr("class", "carousel-item active")
        }
        
        $(".carousel-inner").append(temp)
    }
})