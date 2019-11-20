flashcard_temp = $("#flashcard-template").clone()

var flashCount = 5
for (i = 2; i < flashCount + 1; i++) {
    flashcard = flashcard_temp.clone()
    $("span", flashcard).text(i + '.')
    flashcard.appendTo("#flashcards")
}

$('#add-flash').on('click', () => {
    flashCount += 1
    flashcard = flashcard_temp.clone()
    $("span", flashcard).text(flashCount + '.')
    flashcard.appendTo("#flashcards")
})

$(document.body).on("click", ".delete-flash", function () {
    if(flashCount == 2){
        return
    }

    flashCount -= 1
    $(this).closest("#flashcard-template").remove()
    $('span.index').each(function (index) {
        $(this).text((index+1)+'.')
    });
})

$('#create').on('click', () => {
    console.log($('#title').val())
    $('textarea.term-input').each(function (index) {
        console.log($(this).val())
    });

    $('textarea.def-input').each(function (index) {
        console.log($(this).val())
    });
})