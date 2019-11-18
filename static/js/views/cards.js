$(document).ready(function() { 
    retriveData("card.html", $("#CarouselContent"), `/api/cardSet/${$("#set").attr("value")}`)
})