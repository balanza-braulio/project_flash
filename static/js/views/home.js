$(document.body).on("click", ".btn-danger", async function () {
    var delUrl = `/${$(this).attr("id")}`;
    var toDel = $(this)
        .closest(".cardFlex");
    var restItems = $("#cardSets").children();
    var subtraction = restItems.filter((index, value, arr) => {
        var valId = $(value).attr("id");
        var toDelId = $(toDel).attr("id");
        return valId != toDelId;
    });
    try {
        await $.ajax({
            url: delUrl,
            method: "GET",
            success: (res, status) => {
                
                toDel.fadeOut(500, function () {
                    toDel
                        .remove();
                });

            },
            error: e => {
                return e;
            }
        });
    } catch (e) {
        console.log(e);
    }
});
