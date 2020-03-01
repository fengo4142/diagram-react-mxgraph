
import { default as MxGraph } from "./node_modules/mxgraph";
import { initToolbar, getStyleByKey, getStyleStringByObj } from ".";

const {
  mxEvent,
  mxGraph,
  mxConnectionHandler,
  mxImage,
  mxClient,
  mxRubberband,
  mxConstants,
  mxUtils,
  mxGeometry,
  mxPoint,
  mxHierarchicalLayout,
  mxFastOrganicLayout,
  mxEdgeHandler,
  mxUndoManager,
  mxKeyHandler,
  mxGraphHandler,
  mxConstraintHandler,
  mxGuide,
  mxEdgeStyle,
  mxPerimeter,
  mxCellState,
  mxConnectionConstraint,
  mxDragSource
} = MxGraph();

export default function setInitialConfiguration(
  graph,
  toolbarRef,
  bottomToobarRef
) {
  mxConnectionHandler.prototype.connectImage = new mxImage(
    "images/connector.gif",
    16,
    16
  );

  // mxEdgeHandler.prototype.parentHighlightEnabled = true;
  // mxEdgeHandler.prototype.dblClickRemoveEnabled = true;
  // mxEdgeHandler.prototype.straightRemoveEnabled = true;
  // mxEdgeHandler.prototype.virtualBendsEnabled = true;
  // mxEdgeHandler.prototype.mergeRemoveEnabled = true;
  // mxEdgeHandler.prototype.manageLabelHandle = true;
  // mxEdgeHandler.prototype.outlineConnect = true;

  // // Specifies if waypoints should snap to the routing centers of terminals
  // mxEdgeHandler.prototype.snapToTerminals = true;

  // mxEdgeHandler.prototype.addEnabled = true;
  // mxEdgeHandler.prototype.removeEnabled = true;

  // new mxRubberband(graph);
  // mxRubberband.prototype.defaultOpacity = 30;
  // mxRubberband.prototype.sharedDiv = document.createElement("div");
  // mxRubberband.prototype.sharedDiv.style.backgroundColor = "red";
  graph.centerPage = true;
  graph.setPanning(true);
  graph.setTooltips(true);
  graph.setConnectable(true);
  graph.setEnabled(true);
  graph.setEdgeLabelsMovable(false);
  graph.setVertexLabelsMovable(false);
  graph.setGridEnabled(true);
  graph.setAllowDanglingEdges(false);
  // Workaround for Firefox where first mouse down is received
  // after tap and hold if scrollbars are visible, which means
  // start rubberband immediately if no cell is under mouse.
  var isForceRubberBandEvent = mxRubberband.isForceRubberbandEvent;
  mxRubberband.isForceRubberbandEvent = function(me) {
    return (
      (isForceRubberBandEvent.apply(this, arguments) &&
        !mxEvent.isShiftDown(me.getEvent()) &&
        !mxEvent.isControlDown(me.getEvent())) ||
      (mxClient.IS_CHROMEOS && mxEvent.isShiftDown(me.getEvent())) ||
      (mxUtils.hasScrollbars(this.graph.container) &&
        mxClient.IS_FF &&
        mxClient.IS_WIN &&
        me.getState() == null &&
        mxEvent.isTouchEvent(me.getEvent()))
    );
  };

  mxGraphHandler.prototype.guidesEnabled = true;
  // Alt disables guides
  mxGuide.prototype.isEnabledForEvent = function(evt) {
    return !mxEvent.isAltDown(evt);
  };

  mxConstraintHandler.prototype.pointImage = new mxImage(
    "images/point.gif",
    5,
    5
  );

  graph.getView().updateStyle = true;
  initToolbar(graph, toolbarRef.current, bottomToobarRef.current);
  const parent = graph.getDefaultParent();
  graph.getModel().beginUpdate();
  try {
    const styleSheet = graph.getStylesheet();
    var style = [];
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_FILLCOLOR] = "#C3D9FF";
    style[mxConstants.STYLE_STROKECOLOR] = "#6482B9";
    style[mxConstants.STYLE_STROKEWIDTH] = 2;
    style[mxConstants.STYLE_FONTCOLOR] = "#774400";
    style[mxConstants.HANDLE_FILLCOLOR] = "#80c6ee";
    style[mxConstants.STYLE_FONTSIZE] = "20";
    graph.getStylesheet().putDefaultVertexStyle(style);
    style = [];
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
    style[mxConstants.STYLE_STROKECOLOR] = "#f90";
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
    style[mxConstants.STYLE_FONTSIZE] = "10";
    style[mxConstants.VALID_COLOR] = "#27bf81";
    graph.getStylesheet().putDefaultEdgeStyle(style);

    let vertexStyles = graph.getStylesheet().getDefaultVertexStyle();
    let edgeStyles = graph.getStylesheet().getDefaultEdgeStyle();

    var v1 = graph.insertVertex(parent, null, "Hello,", 20, 20, 80, 30);
    v1.style = getStyleStringByObj(vertexStyles);

    var v2 = graph.insertVertex(parent, null, "World!", 200, 150, 80, 30);
    v2.style = getStyleStringByObj(vertexStyles);
    var e1 = graph.insertEdge(parent, null, "", v1, v2);
    //e1.style = getStyleStringByObj(edgeStyles);
  } finally {
    var undoManager = new mxUndoManager();
    var listener = function(sender, evt) {
      undoManager.undoableEditHappened(evt.getProperty("edit"));
    };
    graph.getModel().addListener(mxEvent.UNDO, listener);
    graph.getView().addListener(mxEvent.UNDO, listener);

    const keyHandler = new mxKeyHandler(graph);
    // Undo handler: CTRL + Z
    keyHandler.bindControlKey(90, function(evt) {
      undoManager.undo();
    });

    // Redo handler: CTRL + SHIFT + Z
    keyHandler.bindControlShiftKey(90, function(evt) {
      undoManager.redo();
    });

    // Delete handler.
    keyHandler.bindKey(46, function(evt) {
      if (graph.isEnabled()) {
        const currentNode = graph.getSelectionCell();
        console.log(currentNode);
        graph.removeCells([currentNode]);
      }
    });

    // Delete handler.
    keyHandler.bindKey(8, function(evt) {
      if (graph.isEnabled()) {
        const currentNode = graph.getSelectionCell();
        graph.removeCells([currentNode]);
      }
    });
  }
}
