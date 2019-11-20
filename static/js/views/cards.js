$(document).ready(async function() { 
    //retriveData("/templates/cards.handlebars", "#CarouselContent", `/api/cardSet/${$("#set").attr("value")}`)

    var list = await $.ajax({
        datatype: "json",
        url: `/api/cardSet/${$("#set").attr("value")}`
    })

    var cards = list.Cards

    for(var i = 0; i < cards.length; i++) { 
        var temp = $("#template").clone()

        temp.find("#front")[0].innerHTML = cards[i].card_front
        temp.find("#back")[0].innerHTML = cards[i].card_back
        temp[0].removeAttribute("hidden")
        temp[0].removeAttribute("id")

        if(i == 0) {
            temp.attr("class", "carousel-item active")
        }
        
        $(".carousel-inner").append(temp)

        var tablerow = $("<tr>")
        tablerow.append($(`<th scope='row'>${i+1}</th>`))
        tablerow.append($(`<td>${cards[i].card_front}</td>`))
        tablerow.append($(`<td>${cards[i].card_back}</td>`))
        $("#table-body").append(tablerow)
    }

    $("#author-username")[0].innerHTML = list.user.username
})

//Button to display carousel
$("#flash-view").on("click", function() { 
    $("#myCarousel")[0].removeAttribute("hidden")
    $("#tableView").attr("hidden","")
})

//Button to display table
$("#list-view").on("click", function() { 
    $("#tableView")[0].removeAttribute("hidden")
    $("#myCarousel").attr("hidden","")
})