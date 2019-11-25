var slideIndex = 1;

$(document).ready(async function() { 
    var list = await $.ajax({
        datatype: "json",
        url: `/api/cardSet/${$("#set").attr("value")}`
    })

    var cards = list.Cards

    $(".description")[0].innerHTML = list.cardSet_description

    for(var i = 0; i < cards.length; i++) { 
        var temp = $("#template").clone()

        temp.attr("class", "mySlides transition")
        temp.find("#front")[0].innerHTML = cards[i].card_front
        temp.find("#back")[0].innerHTML = resize(cards[i].card_back, temp.find("#back"))
        temp.find(".numbertext")[0].innerHTML = `${i+1} / ${cards.length}`
        temp[0].removeAttribute("hidden")
        temp[0].removeAttribute("id")

        $("#slideshow-slides").append(temp)

        var tablerow = $("<tr>")
        tablerow.append($(`<th scope='row'>${i+1}</th>`))
        tablerow.append($(`<td>${cards[i].card_front}</td>`))
        tablerow.append($(`<td>${cards[i].card_back}</td>`))
        $("#table-body").append(tablerow)
    }

    //Event to flip card
    $(".flip-card-inner").on("click", function() { 
        console.log(this)
        this.classList.toggle("is-flipped")
    })

    showSlides(slideIndex);

    $("#author-username")[0].innerHTML = list.user.username
})

// Button to display slideshow
$("#flash-view").on("click", function() { 
    $(".slideshow-container")[0].removeAttribute("hidden")
    $("#tableView").attr("hidden","")
})

// Button to display table
$("#list-view").on("click", function() { 
    $("#tableView")[0].removeAttribute("hidden")
    $(".slideshow-container").attr("hidden","")
})

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }

  slides[slideIndex-1].style.display = "block";
}

function resize(str, selector) {

    let size = 32
    if(str.length > 200) {
        selector.css("font-size", "16px")
        let i = str.lastIndexOf(" ", 200)
        return str.substring(0, i) + "..."
    }
    else if(str.length > 150) { 
        size = 16
    }
    else if(str.length > 100) { 
        size = 20
    }
    else if(str.length > 50) {
        size = 24
    }

    selector.css("font-size", `${size}px`)
    return str
}