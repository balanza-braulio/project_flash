$(document).ready(async function () {
    $("#search-input").on("keyup", async function () {

        var search = $(this).val()
        const url = `/api/search-name/${search}`;
        const toAppend = [];
        $.ajax({
            url: url,
            method: "GET",
            success: (res, status) => {
                var x = res;
                x.forEach(cardSet => {
                    toAppend.push($("<a>").prop("class", "dropdown-item").prop("href", `/cardSet/${cardSet.cardSet_id}`).text(`${cardSet.cardSet_name}`));
                });
                var dropdown = $("#search-menu");
                $(dropdown).children().remove();
                $(dropdown).append(toAppend);
            },
            error: (error) => { },
        });
    });
});
