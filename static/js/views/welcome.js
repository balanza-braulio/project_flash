jqueryNoConflict(document).ready(function () {
    $(document.body).on("click", ".btn-like", async function () {
        var url = '/api/likeCardSet/';
        var id = {id: `${$(this).attr("id")}`};
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
                    return e;
                }
            });
        } catch (e) {
            console.log(e);
        }
    });
});