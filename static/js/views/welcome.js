jqueryNoConflict(document).ready(function () {
    $(document.body).on("click", ".btn-like", async function () {
        var url = '/api/likeCardSet/';
        var id = { id: `${$(this).attr("id")}` };
        var toLike = $(this)
            .closest(".cardFlex");
        try {
            await $.ajax({
                url: url,
                method: "POST",
                data: id,
                success: (res, status) => {

                    // toDel.slideUp(600, function () {
                    //     toDel
                    //         .remove();
                    // });
                },
                error: e => {
                    var loginAlert = $("<div>")
                        .prop("id", "save_login")
                        .prop("class", "alert alert-success alert-dismissible fade show")
                        .prop("role", "alert")
                        .css("position", "fixed")
                        .css("width", "100%")
                        .append($("<strong>").text("Error: "))
                        .append($("<p>").text(e.responseText));
                    var saveAlertClose = $("<button>")
                        .prop("type", "button")
                        .prop("class", "close")
                        .prop("data-dismiss", "alert")
                        .prop("aria-label", "Close")
                        .append($("<span>")
                            .prop("aria-hidden", "true")
                            .text("X"));
                    saveAlertClose.on("click",() => {
                    loginAlert.fadeOut(500, () => {/*loginAlert.remove()*/})
                    });
                    loginAlert.append(saveAlertClose);

                    $(".navbar").after(loginAlert);
                    return e;
                }
            });
        } catch (e) {
            console.log(e);
        }
    });
});