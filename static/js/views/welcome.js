jqueryNoConflict(document).ready(function () {
    $(document.body).on("click", ".btn-like", async function () {
        var url = '/api/likeCardSet/';
        var id = { id: `${$(this).prop("id")}` };
        var toLike = $(this)
            .closest(".cardFlex");
        var currentBtn = $(this);
        var toLikeName = $(toLike).find(".setCard_name").text();
        $(currentBtn).delay(200).blur();
        try {
            await $.ajax({
                url: url,
                method: "POST",
                data: id,
                success: (res, status) => {

                    $(currentBtn).removeClass("btn-outline-light").addClass("btn-light").removeClass("btn-like").addClass("btn-liked");
                },
                error: e => {
                    if (e.status == 401) {
                        var loginAlert = $("<div>")
                            .prop("id", "save_login")
                            .prop("class", "alert alert-danger alert-dismissible fade show ")
                            .prop("role", "alert")
                            .append($("<strong>").text("Cannot save " + toLikeName + ": "))
                            .append($("<p>").text(e.responseText));

                        loginAlert.delay(2000).fadeOut(1000, () => { loginAlert.remove() });

                        $("#alerts").append(loginAlert);
                        return e;
                    }
                    else if (e.status == 409) {
                        var alreadyLikedAlert = $("<div>")
                            .prop("id", "alredyLiked")
                            .prop("class", "alert alert-danger alert-dismissible fade show ")
                            .prop("role", "alert")
                            .append($("<strong>").text("Cannot like this card set (" + toLikeName + ")."))
                            .append($("<p>").text(e.responseText));

                        alreadyLikedAlert.delay(2000).fadeOut(1000, () => { alreadyLikedAlert.remove() });

                        $("#alerts").append(alreadyLikedAlert);
                        return e;
                    }
                }
            });
        } catch (e) {
            console.log(e);
        }
    });
    $(document.body).on("click", ".btn-liked", async function () {
        var currentBtn = $(this);
        var url = `/api/deleteLike/${$(this).prop("id")}`;
        $(currentBtn).delay(200).blur();
        $.ajax({
            url: url,
            method: "DELETE",
            success: () => { $(currentBtn).removeClass("btn-light").addClass("btn-outline-light").removeClass("btn-liked").addClass("btn-like"); },
            error: (e) => {
                if (e.status == 400) {
                    var cannotUnlike = $("<div>")
                        .prop("id", "cannotUnlike")
                        .prop("class", "alert alert-danger alert-dismissible fade show ")
                        .prop("role", "alert")
                        .append($("<strong>").text("Cannot unlike this card set (" + toLikeName + ")."))

                    cannotUnlike.delay(2000).fadeOut(1000, () => { cannotUnlike.remove() });

                    $("#alerts").append(cannotUnlike);
                    console.log(e);
                }
            },
        });
    })

});