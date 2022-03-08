
const Arsenic = (function (){

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

      http.onreadystatechange = function() {
          if(http.readyState === XMLHttpRequest.DONE) {
              if(http.status == 200) {
                  console.log(http.responseText);
              } else {
                  console.log(http.responseText);
                  var j = JSON.parse(http.responseText);
                  document.getElementById("errstatus").textContent = j.Status;
                  document.getElementById("errmsg").textContent = j.Msg;
              }
          }
      }

      http.onerror = function() {
          document.getElementById("errstatus").textContent = "ERROR";
          document.getElementById("errmsg").textContent = "Unable to contact server";
      }
      http.send(JSON.stringify({
        id: lead
      }));
    },
    getHostContentResults: async function (host) {
      var url = `${this.baseUrl}/host/content`;
      return new Promise((resolve, reject) => {
        $.post(url, JSON.stringify({host: host}), (data) => {
          resolve(data)
        }).fail(() => reject())
      })
    }
  }
})()

const Util = (function(){
  return {
    newExpander: function (parent, label, content) {
      let labelElem = $(`<div class="expand-label" style="cursor: pointer;" onclick="$h = $(this);$h.next('div').slideToggle(100,function () {$h.children('i').attr('class',function () {return $h.next('div').is(':visible') ? 'fas fa-chevron-down' : 'fas fa-chevron-right';});});">
        <i style="font-size:x-small;" class="fas fa-chevron-right"></i>
      </div>`)

      let labelSpan = document.createElement("span")
      labelSpan.innerText = label

      labelElem.append(labelSpan)

      let contentElem = $(`<div class="expand-content" style="display: none;"></div>`)

      let pre = document.createElement("pre")
      pre.innerText = content

      contentElem.append(pre)

      parent.append(labelElem, contentElem)
    }
  }
})()


jQuery(document).ready(function() {
  $("a").attr("rel", "noopener noreferrer nofollow")
  $("a[data-vector]").each((index, el) => { $(el).attr("href", $(el).attr("href") + $(el).data("vector") ) })
  $(".container table:not(.table)").addClass("table")

  $("button[data-lead-action]").each((index, el) => {
    console.log(el)
    let $el = $(el)
    $el.click(() => {
      Arsenic.doLeadAction($el.data("lead-action"), $el.data("lead-id"));
    })
  });

  // Populate content discovery tab on the single host page
  $("#content-tab[data-host]").each((index, el) => {
    let tab = $(el)
    let host = tab.data("host")
    Arsenic.getHostContentResults(host)
    .then(results => {
      for (let key of Object.keys(results)) {
        let content = results[key].map(result => result.Url).join("\n")
        Util.newExpander(tab, key, content)
      }
    },
    () => console.log("Error retrieving host content"))
  })
})
