const Arsenic = (function () {

  return {
    baseUrl: 'http://localhost:7433/api',
    doLeadAction: function (action, lead) {
      document.getElementById("errstatus").textContent = "";
      document.getElementById("errmsg").textContent = "";
      var http = new XMLHttpRequest();
      var url = `${this.baseUrl}/lead/` + action;
      http.open('POST', url, true);

      //Send the proper header information along with the request
      http.setRequestHeader('Content-type', 'application/json');

      http.onreadystatechange = function () {
        if (http.readyState === XMLHttpRequest.DONE) {
          if (http.status == 200) {
            console.log(http.responseText);
          } else {
            console.log(http.responseText);
            var j = JSON.parse(http.responseText);
            document.getElementById("errstatus").textContent = j.Status;
            document.getElementById("errmsg").textContent = j.Msg;
          }
        }
      }

      http.onerror = function () {
        document.getElementById("errstatus").textContent = "ERROR";
        document.getElementById("errmsg").textContent = "Unable to contact server";
      }
      http.send(JSON.stringify({
        id: lead
      }));
    }
  }
})()

// class RedirectCell extends TableCell {
//   constructor(url, redirect) {
//     super()
//     this.url = url
//     this.redirect = redirect
//   }
//   toHTML() {
//     let icon = new IconCell(["fa-solid", "fa-arrow-rotate-right", "fa-rotate-by", "rotate-160"])
//     let row = [new TextCell(`${this.url}\n${this.redirect}`), icon]
//     let table = Util.Table.newTable(null, [row])
//     table.removeClass()
//     table.addClass("borderless")

//     let td = super.toHTML()
//     td.append(table)
//     return td[0]
//   }
// }

jQuery(document).ready(function () {
  $("a").attr("rel", "noopener noreferrer nofollow")
  $("a[data-vector]").each((index, el) => {
    $(el).attr("href", $(el).attr("href") + $(el).data("vector"))
  })
  $(".container table:not(.table)").addClass("table")

  $("button[data-lead-action]").each((index, el) => {
    console.log(el)
    let $el = $(el)
    $el.click(() => {
      Arsenic.doLeadAction($el.data("lead-action"), $el.data("lead-id"));
    })
  });
})