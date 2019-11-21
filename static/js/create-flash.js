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
    if (flashCount == 2) {
        return
    }

    flashCount -= 1
    $(this).closest("#flashcard-template").remove()
    $('span.index').each(function (index) {
        $(this).text((index + 1) + '.')
    });
})

$('#create').on('click', () => {
    title = $('#title').val().trim()
    description = $('#description').val().trim()
    terms = []
    defs = []
    flashcards = []

    if (title == '') {
        $('#title').css({
            'border-color': '#c0392b',
            'border-width': '3px'
        })
        return
    }

    $('textarea.term-input').each(function (index) {
        terms.push($(this).val())
    });

    $('textarea.def-input').each(function (index) {
        defs.push($(this).val())
    });

    for (i = 0; i < terms.length; i++) {
        term = terms[i].trim()
        def = defs[i].trim()
        if (term != '' && def != '') {
            flashcards.push({
                term: term,
                definition: def,
            })
        }
    }

    if (flashcards.length < 2) {
        return
    }

    payload = {
        title: title,
        description: description,
        flashcards: flashcards
    }

    $.ajax({
        url: '/create-flash',
        method: "POST",
        data: payload,
    }).then((id) => {
        window.location.replace("/home");
    });

})