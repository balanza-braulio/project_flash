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
    $(".alert-area").empty();

    title = $('#title').val().trim()
    description = $('#description').val().trim()
    terms = []
    defs = []
    flashcards = []
    errors = []

    if (title == '') {
        $('#title').css({
            'border-color': '#c0392b',
            'border-width': '3px'
        })

        errors.push("Title can't be empty!");
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
        else {
            errors.push("Card can't be empty from front or back")
            break
        }
    }

    // if (flashcards.length < 2) {
    //     errors.push("Card set must have at least two cards")
    // }

    if(errors.length > 0) {
        for(var x of errors)
        {   
            var temp = $("#alert-template").clone()
            temp.removeAttr("id")
            temp.removeAttr("hidden")
            temp[0].innerHTML = x

            $(".alert-area").append(temp)
        }

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
        statusCode: {
            400: function() {
                var temp = $("#alert-template").clone()
                temp.removeAttr("id")
                temp.removeAttr("hidden")
                temp[0].innerHTML = "You can't have two sets which are named the same"

                $(".alert-area").append(temp)
            }
        }
    }).then((id) => {
        window.location.replace("/home");
    });

})