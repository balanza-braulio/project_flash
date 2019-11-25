jqueryNoConflict(document).ready(function () {
    $(document.body).on("click", ".btn-like", async function () {
        var url = '/api/likeCardSet/';
        var id = { id: `${$(this).attr("id")}` };
        var toLike = $(this)
            .closest(".cardFlex");
        var toLikeName = $(toLike).find(".setCard_name").text();
        try {
            await $.ajax({
                url: url,
                method: "POST",
                data: id,
                success: (res, status) => {

                    var likedAlert = $("<div>")
                            .prop("id", "likedAlert")
                            .prop("class", "alert alert-success alert-dismissible fade show ")
                            .prop("role", "alert")
                            .append($("<strong>").text("Card set " + toLikeName + " saved!"))
                            .append($("<p>").text("Go to home to view it!"));

                        likedAlert.delay(2000).fadeOut({duration: 1000, queue: true}, () => { likedAlert.remove() });

                        $("#alerts").append(likedAlert);
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
});