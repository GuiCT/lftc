function init() {
  myDiagram = new go.Diagram('myDiagramDiv', {
    'animationManager.initialAnimationStyle': go.AnimationStyle.None,
    InitialAnimationStarting: (e) => {
      var animation = e.subject.defaultAnimation;
      animation.easing = go.Animation.EaseOutExpo;
      animation.duration = 800;
      animation.add(e.diagram, 'scale', 0.3, 1);
      animation.add(e.diagram, 'opacity', 0, 1);
    },

    // have mouse wheel events zoom in and out instead of scroll up and down
    'toolManager.mouseWheelBehavior': go.WheelMode.Zoom,
    // support double-click in background creating a new node
    'clickCreatingTool.archetypeNodeData': { text: 'new node' },
    // enable undo & redo
    'undoManager.isEnabled': true
  });

  // when the document is modified, add a "*" to the title and enable the "Save" button
  myDiagram.addDiagramListener('Modified', (e) => {
    var button = document.getElementById('SaveButton');
    if (button) button.disabled = !myDiagram.isModified;
    var idx = document.title.indexOf('*');
    if (myDiagram.isModified) {
      if (idx < 0) document.title += '*';
    } else {
      if (idx >= 0) document.title = document.title.slice(0, idx);
    }
  });

  const colors = {
    pink: '#facbcb',
    blue: '#b7d8f7',
    green: '#b9e1c8',
    yellow: '#faeb98',
    background: '#e8e8e8'
  };
  const colorsDark = {
    green: '#3fab76',
    yellow: '#f4d90a',
    blue: '#0091ff',
    pink: '#e65257',
    background: '#161616'
  };
  myDiagram.div.style.backgroundColor = colors.background;

  myDiagram.nodeTemplate = new go.Node('Auto', {
    isShadowed: true,
    shadowBlur: 0,
    shadowOffset: new go.Point(5, 5),
    shadowColor: 'black'
  })
    .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
    .add(
      new go.Shape('RoundedRectangle', {
        strokeWidth: 1.5,
        fill: colors.blue,
        portId: '',
        fromLinkable: true, fromLinkableSelfNode: false, fromLinkableDuplicates: true,
        toLinkable: true, toLinkableSelfNode: false, toLinkableDuplicates: true,
        cursor: 'pointer'
      })
        .bind('fill', 'type', (type) => {
          if (type === 'Start') return colors.green;
          if (type === 'End') return colors.pink;
          return colors.blue;
        })
        .bind('figure', 'type', (type) => {
          if (type === 'Start' || type === 'End') return 'Circle';
          return 'RoundedRectangle';
        }),
      new go.TextBlock({
        font: 'bold small-caps 11pt helvetica, bold arial, sans-serif',
        shadowVisible: false,
        margin: 8,
        font: 'bold 14px sans-serif',
        stroke: '#333'
      }).bind('text')
    );

  // unlike the normal selection Adornment, this one includes a Button
  myDiagram.nodeTemplate.selectionAdornmentTemplate = new go.Adornment('Spot')
    .add(
      new go.Panel('Auto')
        .add(
          new go.Shape('RoundedRectangle', { fill: null, stroke: colors.pink, strokeWidth: 3 }),
          new go.Placeholder() // a Placeholder sizes itself to the selected Node
        ),

      // the button to create a "next" node, at the top-right corner
      go.GraphObject.build('Button', {
        alignment: go.Spot.TopRight,
        click: addNodeAndLink // this function is defined below
      })
        .add(
          new go.Shape('PlusLine', { width: 6, height: 6 })
        ) // end button
    );

  // clicking the button inserts a new node to the right of the selected node,
  // and adds a link to that new node
  function addNodeAndLink(e, obj) {
    var adornment = obj.part;
    var diagram = e.diagram;
    diagram.startTransaction('Add State');

    // get the node data for which the user clicked the button
    var fromNode = adornment.adornedPart;
    var fromData = fromNode.data;
    // create a new "State" data object, positioned off to the right of the adorned Node
    var toData = { text: 'new' };
    var p = fromNode.location.copy();
    p.x += 200;
    toData.loc = go.Point.stringify(p); // the "loc" property is a string, not a Point object
    // add the new node data to the model
    var model = diagram.model;
    model.addNodeData(toData);

    // create a link data from the old node data to the new node data
    var linkdata = {
      from: model.getKeyForNodeData(fromData), // or just: fromData.id
      to: model.getKeyForNodeData(toData),
      text: 'transition'
    };
    // and add the link data to the model
    model.addLinkData(linkdata);

    // select the new Node
    var newnode = diagram.findNodeForData(toData);
    diagram.select(newnode);
    diagram.commitTransaction('Add State');
    // if the new node is off-screen, scroll the diagram to show the new node
    diagram.scrollToRect(newnode.actualBounds);
  }

  // replace the default Link template in the linkTemplateMap
  myDiagram.linkTemplate = new go.Link({
    // shadow options are for the label, not the link itself
    isShadowed: true,
    shadowBlur: 0,
    shadowColor: 'black',
    shadowOffset: new go.Point(2.5, 2.5),

    curve: go.Curve.Bezier,
    curviness: 40,
    adjusting: go.LinkAdjusting.Stretch,
    reshapable: true,
    relinkableFrom: true,
    relinkableTo: true,
    fromShortLength: 8,
    toShortLength: 10
  })
    .bindTwoWay('points')
    .bind('curviness')
    .add(
      // Main shape geometry
      new go.Shape({ strokeWidth: 2, shadowVisible: false, stroke: 'black' })
        .bind('strokeDashArray', 'progress', (progress) => (progress ? [] : [5, 6]))
        .bind('opacity', 'progress', (progress) => (progress ? 1 : 0.5)),
      // Arrowheads
      new go.Shape({ fromArrow: 'circle', strokeWidth: 1.5, fill: 'white' }).bind('opacity', 'progress', (progress) => (progress ? 1 : 0.5)),
      new go.Shape({ toArrow: 'standard', stroke: null, scale: 1.5, fill: 'black' }).bind('opacity', 'progress', (progress) => (progress ? 1 : 0.5)),
      // The link label
      new go.Panel('Auto')
        .add(
          new go.Shape('RoundedRectangle', {
            shadowVisible: true,
            fill: colors.yellow,
            strokeWidth: 0.5
          }),
          new go.TextBlock({
            font: '9pt helvetica, arial, sans-serif',
            margin: 1,
            editable: true, // enable in-place editing
            text: 'Action' // default text
          }).bind('text')
          // editing the text automatically updates the model data
        )
    );

  // read in the JSON data from the "mySavedModel" element
  load();
}

// Show the diagram's model in JSON format
function save() {
  document.getElementById('mySavedModel').value = myDiagram.model.toJson();
  myDiagram.isModified = false;
}
function load() {
  myDiagram.model = go.Model.fromJson(document.getElementById('mySavedModel').value);
}

window.addEventListener('DOMContentLoaded', init);