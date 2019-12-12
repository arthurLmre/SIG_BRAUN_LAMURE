const Graph = require("node-dijkstra");
const createTableAdj = require("../utils/create-table-adj.js");
const getAllPoint = require("../utils/getAllPoints.js");
var write = require("write-file");
var algoDij = require("../utils/algoDijkstra");
var formatXML = require("../utils/indentXml");


var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("lp_iem_sig.sqlite");
var Point = require("../model/point.js");

var DijkstraController = {
  dijkstra: async (req, res) => {
    let points = await createTableAdj();
    let listAllPoints = await getAllPoint();
    let pointDepart = req.query.first ? `${req.query.first}` : `1`;
    let pointFin = req.query.end ? `${req.query.end}` : `180`;
    let departExist = false;
    let endExist = false;
    points.forEach(point => {
      if (point.sommet == req.query.first) {
        departExist = true;
      }
      if (point.sommet == req.query.end) {
        endExist = true;
      }
    });

    if (departExist && endExist) {
      let stringGraph = "{";

      let counter2 = 0;
      points.forEach(point => {
        stringGraph += `\"${point.sommet}\": {`;
        let counter = 0;
        point.arc.forEach(arc => {
          let sommet1, sommet2;
          listAllPoints.forEach(val => {
            if (val.GEO_POI_ID == point.sommet) {
              sommet1 = val;
            } else if (val.GEO_POI_ID == arc) {
              sommet2 = val;
            }
          });

          let distance = calculDistance(sommet1, sommet2);
          if (distance == 0) {
          } else {
            if (counter == point.arc.length - 1) {
              stringGraph += `\"${arc}\":${distance}`;
            } else {
              stringGraph += `\"${arc}\":${distance},`;
            }
          }
          counter++;
        });
        if (stringGraph[stringGraph.length - 1] == ",") {
          stringGraph = stringGraph.substring(0, stringGraph.length - 1);
        }
        if (counter2 == points.length - 1) {
          stringGraph += "}";
        } else {
          stringGraph += "},";
        }
        counter2++;
      });

      stringGraph += "}";

      let jsonGraph;
      try {
        jsonGraph = JSON.parse(stringGraph);
      } catch (e) {
        throw e;
      }

      const route = new Graph(jsonGraph);

      let path = route.path(pointDepart, pointFin);

      finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100

      var x = Math.round(0xffffff * Math.random()).toString(16);
      var y = 6 - x.length;
      var z = "000000";
      var z1 = z.substring(0, y);
      var color = z1 + x;

      let kmlString = `<?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
          <name>Dijkstra</name>
          <Style id="colorDij">
          <LineStyle>
            <color>${color}</color>
            <width>12</width>
          </LineStyle>
        </Style>`;

      let featuresLineStiring = `
      <Placemark> 
        <name>Distance : ${finaldistance}km</name>
        <styleUrl>#colorDij</styleUrl>
        <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>absolute</altitudeMode>
        <coordinates>`;

      path.forEach(res => {
        let featuresPoint = `<Placemark>`;
        listAllPoints.forEach(point => {
          if (point.GEO_POI_ID == res) {
            featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
              point.GEO_POI_LATITUDE
              } `;
            featuresPoint += `<name>${
              point.GEO_POI_NOM
              }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
              point.GEO_POI_LATITUDE
              }</coordinates></Point></Placemark>`;
          }
        });
        kmlString += featuresPoint;
      });

      featuresLineStiring += `</coordinates>
      </LineString>
      </Placemark>`;

      kmlString += featuresLineStiring;
      kmlString += `  </Document>
      </kml>`;

      kmlString = formatXML(kmlString)

      write("output/Dijkstra.kml.kml", kmlString, err => {
        if (err) {
          throw err;
        }
      });
      res.header("Access-Control-Allow-Origin", "*");
      res.type("application/xml");
      res.send(kmlString);
    } else {
      res.header("Access-Control-Allow-Origin", "*");
      res.type("application/xml");
      res.send("<error>Un point n'existe pas</error>");
    }
  },
  getAllLigne: async (req, res) => {
    let points = await createTableAdj();
    let listAllPoints = await getAllPoint();
    let stringGraph = await algoDij(points);

    let jsonGraph;
    try {
      jsonGraph = JSON.parse(stringGraph);
    } catch (e) {
      throw e;
    }

    const route = new Graph(jsonGraph);

    colors = Array();
    for (let i = 0; i < 9; i++) {
      var x = Math.round(0xffffff * Math.random()).toString(16);
      var y = 6 - x.length;
      var z = "000000";
      var z1 = z.substring(0, y);
      var color = z1 + x;
      colors.push(color);
    }

    let path = route.path("1", "28");
    let finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    let kmlString = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>
        <name>Dijkstra</name>
        <Style id="lineOn">
        <LineStyle>
          <color>${colors[0]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineTwo">
        <LineStyle>
          <color>${colors[1]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineThree">
        <LineStyle>
          <color>${colors[2]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineFour">
        <LineStyle>
          <color>${colors[3]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineFive">
      <LineStyle>
        <color>${colors[4]}</color>
        <width>12</width>
      </LineStyle>
      </Style>
      <Style id="lineSix">
        <LineStyle>
          <color>${colors[5]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineSeven">
        <LineStyle>
          <color>${colors[6]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="linHeigt">
      <LineStyle>
        <color>${colors[7]}</color>
        <width>12</width>
      </LineStyle>
      </Style>
      <Style id="lineNine">
        <LineStyle>
          <color>${colors[8]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineTen">
        <LineStyle>
          <color>${colors[9]}</color>
          <width>12</width>
        </LineStyle>
      </Style>`;

    let featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 0. ${finaldistance}km</name>
      <styleUrl>#lineOn</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("29", "53");
    
    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 1. ${finaldistance}km</name>
      <styleUrl>#lineTwo</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("54", "83");
    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 2. ${finaldistance}km</name>
      <styleUrl>#lineThree</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("84", "111");
    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 3. ${finaldistance}km</name>
      <styleUrl>#lineFour</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("112", "155");
    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 4. ${finaldistance}km</name>
      <styleUrl>#lineFive</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("156", "186");
    
    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 5. ${finaldistance}km</name>
      <styleUrl>#lineSix</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("187", "211");
    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 6. ${finaldistance}km</name>
      <styleUrl>#lineSeven</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("212", "219");
    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 7</name>
      <styleUrl>#lineHeigt</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    path = route.path("231", "259");
    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 8. ${finaldistance}km</name>
      <styleUrl>#lineNine</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    kmlString += `  </Document>
    </kml>`;

    kmlString = formatXML(kmlString)

    write("output/AllBus-AllArc.kml.kml", kmlString, err => {
      if (err) {
        throw err;
      }
    });

    res.header("Access-Control-Allow-Origin", "*");
    res.type("application/xml");
    res.send(kmlString);
  },
  showBusLigne: async (req, res) => {
    let points = new Array();
    await new Promise((resolve, reject) => {
      db.all("SELECT * FROM GEO_POINT WHERE GEO_POI_ID", function (err, rows) {
        if (err) {
          throw err;
        }

        rows.forEach(row => {
          point = new Point(row.GEO_POI_ID, row.GEO_POI_NOM, row.GEO_POI_PARTITION);
          points.push(point);
        });
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      let i = 1;
      points.forEach(async point => {
        await new Promise((resolve, reject) => {
          db.all(
            `SELECT * FROM GEO_ARC WHERE GEO_ARC_DEB = ${
            point.sommet
            } OR GEO_ARC_FIN = ${point.sommet}`,
            function (err, values) {
              if (err) {
                throw err;
              }
              values.forEach(value => {
                if (value.GEO_ARC_DEB == point.sommet) {
                  points.forEach(res => {
                    if (res.sommet == value.GEO_ARC_FIN) {
                      if (point.ligne == res.ligne) {
                        point.addArc(value.GEO_ARC_FIN);
                      }
                    }
                  })
                }
                if (value.GEO_ARC_FIN == point.sommet) {
                  points.forEach(res => {
                    if (res.sommet == point.sommet) {
                      if (point.ligne == res.ligne) {
                        point.addArc(value.GEO_ARC_DEB);
                      }
                    }
                  })
                }
              });

              resolve();
            }
          );
        });
        if (i == points.length) {
          resolve();
        }
        i++;
      });
    });

    let listAllPoints = await getAllPoint();
    let stringGraph = await algoDij(points);

    let jsonGraph;
    try {
      jsonGraph = JSON.parse(stringGraph);
    } catch (e) {
      throw e;
    }

    const route = new Graph(jsonGraph);

    colors = Array();
    for (let i = 0; i < 9; i++) {
      var x = Math.round(0xffffff * Math.random()).toString(16);
      var y = 6 - x.length;
      var z = "000000";
      var z1 = z.substring(0, y);
      var color = z1 + x;
      colors.push(color);
    }

    let path = route.path("1", "28");

    let finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    let kmlString = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>
        <name>Dijkstra</name>
        <Style id="lineOn">
        <LineStyle>
          <color>${colors[0]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineTwo">
        <LineStyle>
          <color>${colors[1]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineThree">
        <LineStyle>
          <color>${colors[2]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineFour">
        <LineStyle>
          <color>${colors[3]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineFive">
      <LineStyle>
        <color>${colors[4]}</color>
        <width>12</width>
      </LineStyle>
      </Style>
      <Style id="lineSix">
        <LineStyle>
          <color>${colors[5]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineSeven">
        <LineStyle>
          <color>${colors[6]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="linHeigt">
      <LineStyle>
        <color>${colors[7]}</color>
        <width>12</width>
      </LineStyle>
      </Style>
      <Style id="lineNine">
        <LineStyle>
          <color>${colors[8]}</color>
          <width>12</width>
        </LineStyle>
      </Style>
      <Style id="lineTen">
        <LineStyle>
          <color>${colors[9]}</color>
          <width>12</width>
        </LineStyle>
      </Style>`;

    let featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 0. ${finaldistance}km</name>
      <styleUrl>#lineOn</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("29", "53");

    finaldistance = 0;

    for(let i=0; i<path.length-1; i++){

      let sommet1 = path[i]
      let sommet2 = path[i+1]
      finaldistance += jsonGraph[sommet1][sommet2]/1000
      
    
    }

    finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 1. ${finaldistance}km</name>
      <styleUrl>#lineTwo</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("54", "83");

    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 2. ${finaldistance}km</name>
      <styleUrl>#lineThree</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("84", "111");

    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 3. ${finaldistance}km</name>
      <styleUrl>#lineFour</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("112", "155");

    finaldistance = 0;

    for(let i=0; i<path.length-1; i++){

      let sommet1 = path[i]
      let sommet2 = path[i+1]
      finaldistance += jsonGraph[sommet1][sommet2]/1000
      
    
    }

    finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 4. ${finaldistance}km</name>
      <styleUrl>#lineFive</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("156", "186");

    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 5. ${finaldistance}km</name>
      <styleUrl>#lineSix</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("187", "211");

    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 6. ${finaldistance}km</name>
      <styleUrl>#lineSeven</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

    featuresLineStiring += `</coordinates>
    </LineString>
    </Placemark>`;

    kmlString += featuresLineStiring;

    path = route.path("212", "219");

    finaldistance = 0;

      for(let i=0; i<path.length-1; i++){

        let sommet1 = path[i]
        let sommet2 = path[i+1]
        finaldistance += jsonGraph[sommet1][sommet2]/1000
        
      
      }

      finaldistance = Math.round(finaldistance*100)/100


    featuresLineStiring = `
    <Placemark> 
      <name>Ligne bus 7. ${finaldistance}km</name>
      <styleUrl>#lineHeigt</styleUrl>
      <LineString>
      <extrude>1</extrude>
      <tessellate>1</tessellate>
      <altitudeMode>absolute</altitudeMode>
      <coordinates>`;

    path.forEach(res => {
      let featuresPoint = `<Placemark>`;
      listAllPoints.forEach(point => {
        if (point.GEO_POI_ID == res) {
          featuresLineStiring += `${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            } `;
          featuresPoint += `<name>${
            point.GEO_POI_NOM
            }</name><Point><coordinates>${point.GEO_POI_LONGITUDE},${
            point.GEO_POI_LATITUDE
            }</coordinates></Point></Placemark>`;
        }
      });
      kmlString += featuresPoint;
    });

 

    kmlString += `  </Document>
    </kml>`;

    kmlString = formatXML(kmlString)

    write("output/AllBus-ArcBus.kml.kml", kmlString, err => {
      if (err) {
        throw err;
      }
    });

    res.header("Access-Control-Allow-Origin", "*");
    res.type("application/xml");
    res.send(kmlString);

  }
};

function calculDistance(sommet1, sommet2) {
  const n = 0.7289686274,
    C = 11745793.39,
    e = 0.08248325676,
    Xs = 600000,
    Ys = 8199695.768;

  let gamma0 = 3600 * 2 + 60 * 20 + 14.025;
  gamma0 = (gamma0 / (180 * 3600)) * Math.PI;

  let lat1 = sommet1.GEO_POI_LATITUDE * 3600;
  let lon1 = sommet1.GEO_POI_LONGITUDE * 3600;
  lat1 = (lat1 / (180 * 3600)) * Math.PI;
  lon1 = (lon1 / (180 * 3600)) * Math.PI;

  let lat2 = sommet2.GEO_POI_LATITUDE * 3600;
  let lon2 = sommet2.GEO_POI_LONGITUDE * 3600;
  lat2 = (lat2 / (180 * 3600)) * Math.PI;
  lon2 = (lon2 / (180 * 3600)) * Math.PI;

  let L1 =
    0.5 * Math.log((1 + Math.sin(lat1)) / (1 - Math.sin(lat1))) -
    (e / 2) * Math.log((1 + e * Math.sin(lat1)) / (1 - e * Math.sin(lat1)));
  let R1 = C * Math.exp(-n * L1);
  let gamma1 = n * (lon1 - gamma0);

  let L2 =
    0.5 * Math.log((1 + Math.sin(lat2)) / (1 - Math.sin(lat2))) -
    (e / 2) * Math.log((1 + e * Math.sin(lat2)) / (1 - e * Math.sin(lat2)));
  let R2 = C * Math.exp(-n * L2);
  let gamma2 = n * (lon2 - gamma0);

  let Lx1 = Xs + R1 * Math.sin(gamma1);
  let Ly1 = Ys - R1 * Math.cos(gamma1);

  let Lx2 = Xs + R2 * Math.sin(gamma2);
  let Ly2 = Ys - R2 * Math.cos(gamma2);

  let distance = Math.sqrt(Math.pow(Lx2 - Lx1, 2) + Math.pow(Ly2 - Ly1, 2));

  return distance;
}

module.exports = DijkstraController;
