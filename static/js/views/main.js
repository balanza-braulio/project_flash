$(document).ready(async function () {
    $("#search-input").on("keyup", async function () {

        var dropdown = $("#search-menu");
        $(dropdown).fadeOut(500).remove();

        var search = $(this).val()
        const url = `/api/search-name/${search}`;
        const toAppend = [];
        $.ajax({
            url: url,
            method: "GET",
            success: (res, status) => {

                res.forEach(cardSet => {
                    toAppend.push($("<a>").prop("class", "dropdown-item").prop("href", `/cardSet/${cardSet.cardSet_id}`).text(`${cardSet.cardSet_name}`));
                });

                if (res.length != 0) {
                    var newDropdown = $("<div>").prop("id", "search-menu").prop("class", "dropdown-menu show").attr("aria-labelledby", "dropdownMenuButton");
                    $(newDropdown).append(toAppend);
                    $(newDropdown).insertAfter("#search-input");
                }
            },
            error: (error) => { },
        });
    });
});
