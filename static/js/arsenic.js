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
    },
    getContentResults: async function (host) {
      var url = `${this.baseUrl}/host/content`;
      return new Promise((resolve, reject) => {
        $.post(url, JSON.stringify({
          host: host
        }), (data) => {
          resolve(data)
        }).fail(() => reject())
      })
    }
  }
})()

const Util = (function () {
  return {
    Expander: {
      newLabel: function (text) {
        let labelElem = $(`<div class="expand-label" style="cursor: pointer;" onclick="$h = $(this);$h.next('div').slideToggle(100,function () {$h.children('i').attr('class',function () {return $h.next('div').is(':visible') ? 'fas fa-chevron-down' : 'fas fa-chevron-right';});});">
          <i style="font-size:x-small;" class="fas fa-chevron-right"></i>
        </div>`)

        let labelSpan = document.createElement("span")
        labelSpan.innerText = text

        labelElem.append(labelSpan)
        return labelElem
      },
      newContent: function (elem) {
        let div = $(`<div class="expand-content" style="display: none;"></div>`)
        div.append(elem)
        return div
      },
      newExpander: function (label, content) {
        let labelElem = this.newLabel(label)
        let contentElem = this.newContent(content)

        let div = $("<div></div>")
        div.append(labelElem, contentElem)

        return div
      },
      newPreExpander: function (label, content) {
        let pre = document.createElement("pre")
        pre.innerText = content

        return this.newExpander(label, pre)
      },
      newTableExpander: function (label, columns, rows) {
        let table = Util.Table.newTable(columns, rows)
        return this.newExpander(label, table)
      }
    },
    Table: {
      newTable: function (columns, rows) {
        let table = $(`
        <table class='table table-striped table-hover'>
          <thead>
            <tr>
            </tr>
          </thead>
        </table>`)

        let tr = table.find("tr")
        if (columns) {
          for (let col of columns) {
            let th = document.createElement("th")
            th.innerText = col

            tr.append(th)
          }
        } else {
          table.find("thead").remove()
        }

        for (let row of rows) {
          table.append(this.newTr(row))
        }

        return table
      },
      newTr: function (data) {
        let tr = $("<tr></tr>")
        for (let item of data) {
          let td
          if (item instanceof(TableCell)) {
            td = item.toHTML()
          } else {
            td = document.createElement("td")
            td.innerText = item
          }

          tr.append(td)
        }
        return tr
      }
    }
  }
})()



class TableCell {
  toHTML() {
    return $("<td></td>")
  }
}

class TextCell extends TableCell {
  constructor(text) {
    super()
    this.text = text
  }
  toHTML() {
    let td = super.toHTML()
    td.text(this.text)
    td.html(td.html().replace(/\n/g,'<br/>'))
    return td[0]
  }
}

class RedirectCell extends TableCell {
  constructor(url, redirect) {
    super()
    this.url = url
    this.redirect = redirect
  }
  toHTML() {
    let icon = new IconCell(["fa-solid", "fa-arrow-rotate-right", "fa-rotate-by", "rotate-160"])
    let row = [new TextCell(`${this.url}\n${this.redirect}`), icon]
    let table = Util.Table.newTable(null, [row])
    table.removeClass()
    table.addClass("borderless")

    let td = super.toHTML()
    td.append(table)
    return td[0]
  }
}

class IconCell extends TableCell {
  constructor(classes) {
    super()
    this.classes = classes
  }
  toHTML() {
    let i = $("<i></i>")

    for (let c of this.classes) {
      i.addClass(c)
    }

    let td = super.toHTML()
    td.append(i)
    return td[0]
  }
}

class ContentResults {
  constructor(statusCode, results) {
    this.statusCode = statusCode
    this.results = results.map(result => new ContentResult(result))
  }

  toTable() {
    let columns = ["URL", "Content Type", "Content Length"]
    let rows = this.results.map(result => result.toRow(this.statusCode))
    return Util.Table.newTable(columns, rows)
  }
}

class ContentResult {
  constructor(result) {
    this.url = result.Url
    this.contentType = result.ContentType
    this.contentLength = result.ContentLength
    this.redirect = result.Redirect
  }

  toRow(statusCode) {
    let cells = []

    if (statusCode.startsWith("3")) {
      cells.push(new RedirectCell(this.url, this.redirect))
    } else {
      cells.push(new TextCell(this.url))
    }

    cells.push(new TextCell(this.contentType))
    cells.push(new TextCell(this.contentLength))

    return cells
  }
}

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

  // Populate content discovery tab on the single host page
  $("#content-tab[data-host]").each((index, el) => {
    let tab = $(el)
    let host = tab.data("host")
    Arsenic.getContentResults(host)
      .then(r => {
          for (let statusCode of Object.keys(r)) {
            // let codeResults = results[statusCode]
            // let lines
            // if (statusCode.startsWith("3")) {
            //   lines = codeResults.map(result => `${result.Url} => ${result.Redirect}`)
            // } else {
            //   lines = codeResults.map(result => result.Url)
            // }
            // let expander = Util.Expander.newPreExpander(statusCode, lines.join("\n"))
            // tab.append(expander)
            let results = new ContentResults(statusCode, r[statusCode])
            let table = results.toTable()

            let expander = Util.Expander.newExpander(statusCode, table)
            tab.append(expander)
          }
        },
        () => console.log("Error retrieving host content"))
  })
})