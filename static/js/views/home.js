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
                if (e.status == 400) {
                    var loginAlert = $("<div>")
                        .prop("id", "save_login")
                        .prop("class", "alert alert-danger alert-dismissible fade show ")
                        .prop("role", "alert")
                        .append($("<strong>").text("Error:"))
                        .append($("<p>").text(e.responseText));

                    loginAlert.delay(2000).fadeOut(1000, () => { loginAlert.remove() });

                    $("#alerts").append(loginAlert);
                    return e;
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
});
$(".setCard_unlike").on("click", async function () {
    var delUrl = `/api/deleteLike/${$(this).attr("id")}`;
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
                if (e.status == 400) {
                    var loginAlert = $("<div>")
                        .prop("id", "save_login")
                        .prop("class", "alert alert-danger alert-dismissible fade show ")
                        .prop("role", "alert")
                        .append($("<strong>").text("Error:"))
                        .append($("<p>").text(e.responseText));

                    loginAlert.delay(2000).fadeOut(1000, () => { loginAlert.remove() });

                    $("#alerts").append(loginAlert);
                    return e;
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
});
