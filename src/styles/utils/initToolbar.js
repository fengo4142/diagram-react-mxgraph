import { default as MxGraph } from "./node_modules/mxgraph";
import { addToolbarItem, getStyleStringByObj } from ".";
import ReactDOM from "react-dom";
import { func } from "prop-types";
import parser from "./node_modules/xml-js";

const {
  mxEvent,
  mxRubberband,
  mxUtils,
  mxToolbar,
  mxClient,
  mxDivResizer,
  mxKeyHandler,
  mxGeometry,
  mxCell,
  mxEllipse,
  mxConstants,
  mxPerimeter,
  mxCellRenderer,
  mxText,
  mxCodec
} = MxGraph();

export default function initToolbar(graph, tbContainer, bottomToolbarRef) {
  // Creates new toolbar without event processing
  var tbElement = ReactDOM.findDOMNode(tbContainer);
  tbElement.innerHTML = "";
  var bottomElement = ReactDOM.findDOMNode(bottomToolbarRef);
  bottomElement.innerHTML = "";

  window.td = tbElement;

  var toolbar = new mxToolbar(tbContainer);
  toolbar.enabled = false;

  // Workaround for Internet Explorer ignoring certain styles
  if (mxClient.IS_QUIRKS) {
    document.body.style.overflow = "hidden";
    new mxDivResizer(tbContainer);
  }

  // Enables new connections in the graph
  graph.setConnectable(true);
  graph.setMultigraph(false);

  // Stops editing on enter or escape keypress
  var keyHandler = new mxKeyHandler(graph);
  var rubberband = new mxRubberband(graph);

  var addVertex = function(icon, w, h, style, value = null) {
    var vertex = new mxCell(null, new mxGeometry(0, 0, w, h), style);

    if (value) {
      vertex.value = value;
    }
    vertex.setVertex(true);

    var img = addToolbarItem(graph, toolbar, vertex, icon);
    img.enabled = true;

    graph.getSelectionModel().addListener(mxEvent.CHANGE, function() {
      var tmp = graph.isSelectionEmpty();
      mxUtils.setOpacity(img, tmp ? 100 : 20);
      img.enabled = tmp;
    });
  };

  var baseStyle = { ...graph.getStylesheet().getDefaultVertexStyle() };

  addVertex(
    "images/rectangle.gif",
    100,
    40,
    getStyleStringByObj({
      ...baseStyle,
      fontSize: 16
    })
  );
  addVertex(
    "images/ellipse.gif",
    40,
    40,
    getStyleStringByObj({
      ...baseStyle,
      fontSize: 16,
      [mxConstants.STYLE_SHAPE]: "ellipse"
    })
  );
  // console.log(mxText.getTextCss());
  addVertex(
    "images/text.gif",
    0,
    0,
    "text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];",
    "Text"
  );

  var mx_toolbar = ReactDOM.findDOMNode(bottomToolbarRef);
  mx_toolbar.appendChild(
    mxUtils.button("zoom(+)", function(evt) {
      graph.zoomIn();
    })
  );
  // 缩小按钮
  mx_toolbar.appendChild(
    mxUtils.button("zoom(-)", function(evt) {
      graph.zoomOut();
    })
  );

  mx_toolbar.appendChild(
    mxUtils.button("Fit", function(evt) {
      var margin = 20;
      var max = 30;

      var bounds = graph.getGraphBounds();
      var cw = graph.container.clientWidth - margin;
      var ch = graph.container.clientHeight - margin;
      var w = bounds.width / graph.view.scale;
      var h = bounds.height / graph.view.scale;
      var s = Math.min(max, Math.min(cw / w, ch / h));
      console.log(cw, ch, w, h);
      graph.view.scaleAndTranslate(
        s,
        (margin + cw - w * s) / (2 * s) - bounds.x / graph.view.scale,
        (margin + ch - h * s) / (2 * s) - bounds.y / graph.view.scale
      );
    })
  );
  mx_toolbar.appendChild(
    mxUtils.button("Actual", function(evt) {
      graph.zoomActual();
    })
  );
  mx_toolbar.appendChild(
    mxUtils.button("view JSON", function() {
      var encoder = new mxCodec();
      var node = encoder.encode(graph.getModel());

      var xmlString = mxUtils.getXml(node); // fetch xml (string or document/node)
      console.log(xmlString);
      var result = parser.xml2json(xmlString, { compact: true, spaces: 4 });
      mxUtils.popup(result, true);
    })
  );
  mx_toolbar.appendChild(
    mxUtils.button("load JSON", function() {
      document.querySelector("#upfile").click();
    })
  );
}
