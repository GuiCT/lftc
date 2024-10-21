// import {jsPlumb} from "../lib/jsplumb-browser-ui.umd.js"

jsPlumbContainer = document.getElementById("myDiagramDiv");

const instance = jsPlumb.newInstance({
  container: jsPlumbContainer,
  dragOptions: {
    containment: "notNegative",
  },
});
const ep1 = instance.addEndpoint(document.getElementById("circle1"), {
  target: true,
  source: true,
  endpoint: "Dot",
  anchor: "AutoDefault",
  connector: "Straight",
});
const ep2 = instance.addEndpoint(document.getElementById("circle2"), {
  target: true,
  source: true,
  endpoint: "Dot",
  anchor: "AutoDefault",
  connector: "Straight",
});
// instance.connect({
//   source: ep1,
//   target: ep2,
//   // anchors: ["AutoDefault", "AutoDefault"],
//   connector: {
//     // type: "Bezier",
    
//     overlays: [{ type:"Arrow", options:{location:1}},
//       { type: "Label", options: { label: "Connection 1", location: 0 } },
//     ],
//   },
// });
instance.connect({
  source:ep1,
  target:ep2,
  // anchor: "AutoDefault",
  // endpoints: ["Dot", "Blank"], 
  overlays:[ 
      // { type:"Arrow", options:{location:1}},
      { 
          type:"Label", 
          options:{ label:"foo", location:50 } 
      }
  ]
})
