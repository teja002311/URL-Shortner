$(document).ready(function () {
    $("#shortenLinkButton").click(function () {
        if ($(this).text() === "Shorten!") {
            $(this).text("New link?");
            let url = $("#shortenLink").val().trim();

            if (!url) {
                alert("Please enter a valid URL.");
                return;
            }

            $.ajax({
                type: "POST",
                url: "/short",
                data: { url: url },
                success: function (data) {
                    $("#shortenLinkCopy").val(data);
                    $("#shortenLink").hide('slide', { direction: 'left' }, 1000);
                    $("#shortenLinkCopy").show('slide', { direction: 'right' }, 1000);
                    $("#shortenLinkCopy").select();
                },
                error: function (err) {
                    alert(err.responseText);
                }
            });
        } else {
            $(this).text("Shorten!");
            $("#shortenLink").val("").show();
            $("#shortenLinkCopy").hide();
        }
    });
});
