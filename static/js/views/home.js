$(document.body).on("click", ".setCard_delBtn", async function () {
    var delUrl = `/${$(this).attr("id")}`;
    var toDel = $(this)
        .closest(".cardFlex");
    try {
        await $.ajax({
            url: delUrl,
            method: "DELETE",
            success: (res, status) => {
                
                toDel.slideUp(600, function () {
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
$(".setCard_unlike").on("click",  async function () {
    var delUrl = `/${$(this).attr("id")}`;
    var toDel = $(this)
        .closest(".cardFlex");
    try {
        await $.ajax({
            url: delUrl,
            method: "DELETE",
            success: (res, status) => {
                
                toDel.slideUp(600, function () {
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
