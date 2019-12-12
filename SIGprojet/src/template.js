let html = `<!DOCTYPE html>
<html>

<head>
  <title>SIG</title>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="https://bootswatch.com/4/sketchy/bootstrap.min.css" crossorigin="anonymous"  type="text/css"/>
  <style>/* PrismJS 1.15.0
  https://prismjs.com/download.html#themes=prism-okaidia&languages=markup */
  /**
   * okaidia theme for JavaScript, CSS and HTML
   * Loosely based on Monokai textmate theme by http://www.monokai.nl/
   * @author ocodia
   */
  
  code[class*="language-"],
  pre[class*="language-"] {
    color: #0d0d0b;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;
  
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
  
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }
  
  /* Code blocks */
  pre[class*="language-"] {
    padding: 1em;
    margin: 2.5em 0;
    overflow: auto;
    border-radius: 2.5em;
  }
  
  .jumbotron, .btn {
       border-radius: 2.5em !important;
       background-color: #FF9D83;
       border: white;
       -webkit-box-shadow: 0px 5px 16px 1px rgba(0,0,0,0.5);
              font-family: Arial,serif;
       text-align: center;
  }
  
  :not(pre) > code[class*="language-"],
  pre[class*="language-"] {
   background-color: #FF9D83;
   border: white;
  }
  
  /* Inline code */
  :not(pre) > code[class*="language-"] {
    padding: .1em;
    border-radius: .3em;
    white-space: normal;
  }
  
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: slategray;
  }
  
  .token.punctuation {
    color: #f8f8f2;
  }
  
  .namespace {
    opacity: .7;
  }
  
  .token.property,
  .token.tag,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #f92672;
  }
  
  .token.boolean,
  .token.number {
    color: #ae81ff;
  }
  
  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #a6e22e;
  }
  
  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string,
  .token.variable {
    color: #f8f8f2;
  }
  
  .token.atrule,
  .token.attr-value,
  .token.function,
  .token.class-name {
    color: #e6db74;
  }
  
  .token.keyword {
    color: #66d9ef;
  }
  
  .token.regex,
  .token.important {
    color: #fd971f;
  }
  
  .token.important,
  .token.bold {
    font-weight: bold;
  }
  
  .token.entity {
    cursor: help;
  }
  
  select{
       background-color: #C2FFDC;
       font-family: Arial,serif;
  }
  body > * {
    font-family: Arial,serif;
  }
  #kmlZoneTexte{
    height: 0;
    overflow: hidden;
    padding: 0px !important;
    -webkit-box-shadow: 0px 0px 0px 0px rgba(0,0,0,0.5);

  }
  
  </style>
</head>

<body style="padding: 16px">
  <div class="jumbotron" style="margin-top: 5vh;">
        <div class="row">
             <div class="col-6">
               <fieldset>
                  <legend>Parcours en largeur</legend>
                  <label for="startL">Début: </label>
                  <select name="startL" id="startL"></select>
                  <br>
                  <label for="endL">Fin: </label>
                  <select name="endL" id="endL"></select>
                  <br>
                  <input id="btnParcours" class="btn btn-outline-secondary" type="button" value="Télécharger" />
                </fieldset>
            </div>
             <div class="col-6">
                 <fieldset>
                      <legend>Dijkstra</legend>
                      <label for="startD">Début: </label>
                      <select name="startD" id="startD"></select>
                      <br>
                      <label for="endD">Fin: </label>
                      <select name="endD" id="endD"></select>
                      <br>
                      <input id="btnDijkstra" class="btn btn-outline-secondary" type="button" value="Télécharger" />
                  </fieldset>
            </div>
        </div>
  </div>
  
  <div class="jumbotron" id="kmlZoneTexte" style="margin-top: 5vh;">
    <pre class="language-markup"><code id="kml" class="language-markup"></code></pre>
  </div>
  <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
    crossorigin="anonymous"></script>
  <script>$(document).ready(function () {
    $.ajax({
      method: "GET",
      url: "https://sigproject.herokuapp.com/table",
      dataType: "json",
      success: function (data) {
        var html = "";
        data.forEach(item => {
          html += "<option value=" + item.sommet + ">" + item.name + "</option>";
        });
        $(".jumbotron select").each(function () {
          $(this).html(html);
        });
      },
      error: function () {
        console.log("An error occured during accessing URL");
      }
    });
    $("#btnDijkstra").click(function (e) {
      let first = $("#startD").val();
      let end = $("#endD").val();
      if (first === end) {
        alert("Veuillez choisir 2 arrêts différents");
      }
      $.ajax({
        method: "GET",
        url: "https://sigproject.herokuapp.com/dijkstra?first="+first+"&end="+end,
        dataType: "xml",
        success: function (data) {
          var a = document.createElement("a");
          a.setAttribute("id", "downloadDijkstra");
           var zoneTexte = $("#kmlZoneTexte")
          zoneTexte.css("height", "auto")
          zoneTexte.css("overflow", "visible")
          document.body.appendChild(a);
          a.style = "display: none";
          var kml = new XMLSerializer().serializeToString(data);
          $("#kml").text(kml);
          var blob = new Blob([kml], {
            type: "text/plain"
          });
          url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = "dijkstra.kml";
          a.click();
          window.URL.revokeObjectURL(url);
          mystring = "";
        },
        error: function () {
          console.log("An error occured during accessing URL");
        }
      });
    });
    $("#btnAllBus").click(function (e) {
      $.ajax({
        method: "GET",
        url: \`https://sigproject.herokuapp.com/allBus\`,
        dataType: "xml",
        success: function (data) {
          var a = document.createElement("a");
          a.setAttribute("id", "downloadAllBus");
          document.body.appendChild(a);
          a.style = "display: none";
          var kml = new XMLSerializer().serializeToString(data);
          $("#kml").text(kml);
          var blob = new Blob([kml], {
            type: "text/plain"
          });
          url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = "busWithAllArc.kml";
          a.click();
          window.URL.revokeObjectURL(url);
          mystring = "";
        },
        error: function () {
          console.log("An error occured during accessing URL");
        }
      });
    });
    $("#btnAllBusWithArcLigne").click(function (e) {
      $.ajax({
        method: "GET",
        url: \`https://sigproject.herokuapp.com/arcBusLigne\`,
        dataType: "xml",
        success: function (data) {
          var a = document.createElement("a");
          a.setAttribute("id", "downloadAllBus");
          document.body.appendChild(a);
          a.style = "display: none";
          var kml = new XMLSerializer().serializeToString(data);
          $("#kml").text(kml);
          var blob = new Blob([kml], {
            type: "text/plain"
          });
          url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = "busWithArcLigne.kml";
          a.click();
          window.URL.revokeObjectURL(url);
          mystring = "";
        },
        error: function () {
          console.log("An error occured during accessing URL");
        }
      });
    });
  });
  </script>
  <script>$(document).ready(function () {
    $("#btnParcours").click(function (e) {
      let first = $("#startL").val();
      let end = $("#endL").val();
      if (first === end) {
        alert("Veuillez choisir 2 arrêts différents");
      } else {
      $.ajax({
        method: "GET",
        url: "https://sigproject.herokuapp.com/parcourLargeur?first="+first+"&end="+end,
        dataType: "xml",
        success: function (data) {
          var a = document.createElement("a");
          var zoneTexte = $("#kmlZoneTexte")
          zoneTexte.css("height", "auto")
          zoneTexte.css("overflow", "visible")
          zoneTexte.css("-webkit-box-shadow", "0px 5px 16px 1px rgba(0,0,0,0.5)")
          a.setAttribute("id", "downloadParcours");
          document.body.appendChild(a);
          a.style = "display: none";
          var kml = new XMLSerializer().serializeToString(data);
          $("#kml").text(kml);
          var blob = new Blob([kml], {
            type: "text/plain"
          });
          url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = "parcours.kml";
          a.click();
          window.URL.revokeObjectURL(url);
          mystring = "";
        },
        error: function () {
          console.log("An error occured during accessing URL");
        }
      });
    }
    });
  });
  </script>
</body>

</html>`;

module.exports = html;
