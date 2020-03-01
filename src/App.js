import * as React from "react";
import * as ReactDOM from "react-dom";
import "./styles/diagramEditor.css";
import { default as MxGraph } from "mxgraph";
import { CompactPicker } from "react-color";
import { NumberPicker } from 'react-widgets';
import simpleNumberLocalizer from 'react-widgets-simple-number';
import parser from "xml-js";
import {
  getStyleByKey,
  setInitialConfiguration,
} from "./utils";

const {
  mxEvent,
  mxGraph,
  mxConnectionHandler,
  mxUtils,
  mxPoint,
  mxEdgeHandler,
  mxConstraintHandler,
  mxCodec,
  mxCellState,
  mxConnectionConstraint,
  mxDragSource
} = MxGraph();

simpleNumberLocalizer();

export default function DiagramEditor(props) {
  const containerRef = React.useRef(null);
  const toolbarRef = React.useRef(null);
  const bottomToolbarRef = React.useRef(null);
  const [colorPickerVisible, setColorPickerVisible] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [colorPickerType, setColorPickerType] = React.useState(null);
  const [graph, setGraph] = React.useState(null);
  const [activeFont, setActiveFont] = React.useState(null);

  React.useEffect(() => {
    mxEvent.disableContextMenu(containerRef.current);
    if (!graph) {
      setGraph(new mxGraph(containerRef.current));
    }
    // Adds cells to the model in a single step
    if (graph) {
      // setInitialConfigurationNew(graph, toolbarRef);
      setInitialConfiguration(graph, toolbarRef, bottomToolbarRef);

      // Updates the display
      graph.getModel().endUpdate();
      graph.getModel().addListener(mxEvent.CHANGE, onChange);
      graph.getSelectionModel().addListener(mxEvent.CHANGE, onSelected);
      graph.getModel().addListener(mxEvent.ADD, onElementAdd);
      graph.getModel().addListener(mxEvent.MOVE_END, onDragEnd);
      graph.maximumContainerSize = 1000;
    }
  }, [graph]);
  
  const getEditPreview = () => {
    var dragElt = document.createElement("div");
    dragElt.style.border = "dashed black 1px";
    dragElt.style.width = "120px";
    dragElt.style.height = "40px";
    return dragElt;
  };
  const createDragElement = () => {
    const { graph } = this.state;
    const tasksDrag = ReactDOM.findDOMNode(
      this.refs.mxSidebar
    ).querySelectorAll(".task");
    Array.prototype.slice.call(tasksDrag).forEach(ele => {
      const value = ele.getAttribute("data-value");
      let ds = mxUtils.makeDraggable(
        ele,
        this.graphF,
        (graph, evt, target, x, y) =>
          this.funct(graph, evt, target, x, y, value),
        this.dragElt,
        null,
        null,
        graph.autoscroll,
        true
      );
      ds.isGuidesEnabled = function() {
        return graph.graphHandler.guidesEnabled;
      };
      ds.createDragElement = mxDragSource.prototype.createDragElement;
    });
  };
  
  const settingConnection = () => {
    mxConstraintHandler.prototype.intersects = function(
      icon,
      point,
      source,
      existingEdge
    ) {
      return !source || existingEdge || mxUtils.intersects(icon.bounds, point);
    };

    var mxConnectionHandlerUpdateEdgeState =
      mxConnectionHandler.prototype.updateEdgeState;
    mxConnectionHandler.prototype.updateEdgeState = function(pt, constraint) {
      if (pt != null && this.previous != null) {
        var constraints = this.graph.getAllConnectionConstraints(this.previous);
        var nearestConstraint = null;
        var dist = null;

        for (var i = 0; i < constraints.length; i++) {
          var cp = this.graph.getConnectionPoint(this.previous, constraints[i]);

          if (cp != null) {
            var tmp =
              (cp.x - pt.x) * (cp.x - pt.x) + (cp.y - pt.y) * (cp.y - pt.y);

            if (dist == null || tmp < dist) {
              nearestConstraint = constraints[i];
              dist = tmp;
            }
          }
        }

        if (nearestConstraint != null) {
          this.sourceConstraint = nearestConstraint;
        }

        // In case the edge style must be changed during the preview:
        this.edgeState.style["edgeStyle"] = "orthogonalEdgeStyle";
        // And to use the new edge style in the new edge inserted into the graph,
        // update the cell style as follows:
        this.edgeState.cell.style = mxUtils.setStyle(
          this.edgeState.cell.style,
          "edgeStyle",
          this.edgeState.style["edgeStyle"]
        );
      }

      mxConnectionHandlerUpdateEdgeState.apply(this, arguments);
    };

    if (graph.connectionHandler.connectImage == null) {
      graph.connectionHandler.isConnectableCell = function(cell) {
        return false;
      };
      mxEdgeHandler.prototype.isConnectableCell = function(cell) {
        return graph.connectionHandler.isConnectableCell(cell);
      };
    }

    graph.getAllConnectionConstraints = function(terminal) {
      if (terminal != null && this.model.isVertex(terminal.cell)) {
        return [
          new mxConnectionConstraint(new mxPoint(0.5, 0), true),
          new mxConnectionConstraint(new mxPoint(0, 0.5), true),
          new mxConnectionConstraint(new mxPoint(1, 0.5), true),
          new mxConnectionConstraint(new mxPoint(0.5, 1), true)
        ];
      }
      return null;
    };

    // Connect preview
    graph.connectionHandler.createEdgeState = function(me) {
      var edge = graph.createEdge(
        null,
        null,
        "Edge",
        null,
        null,
        "edgeStyle=orthogonalEdgeStyle"
      );

      return new mxCellState(
        this.graph.view,
        edge,
        this.graph.getCellStyle(edge)
      );
    };
  };

  const onChange = evt => {
    if (graph.view.scale < 1) {
    }
  };

  const onSelected = evt => {
    if (props.onSelected) {
      props.onSelected(evt);      
    }
    console.log(evt.cells[0])
    setSelected(evt.cells[0]);
    setColorPickerVisible(false);
    if (evt.cells[0]) {
      const style = graph.getCellStyle(evt.cells[0])
      const fontSize = typeof style.fontSize === 'string' && style.fontSize.indexOf('px') > 0 ? style.fontSize.slice(0, -2) : style.fontSize
      setActiveFont(parseInt(fontSize))
    }
  };

  const onElementAdd = evt => {
    if (props.onElementAdd) {
      props.onElementAdd(evt);
    }
  };

  const onDragEnd = evt => {
    if (props.onDragEnd) {
      props.onDragEnd(evt);
    }
  };

  const onAdd = geometry => () => {
    //console.log("lets add an", geometry);
  };

  const renderAddButton = geometry => (
    <div
      className={`toolbar-button button-add-${geometry}`}
      onClick={onAdd(geometry)}
      role="button"
    >
      {geometry === "text" && "T"}
    </div>
  );
  
  const renderColorChange = (type, content) => {
    if (!selected || !selected.style) {
      return null;
    }
    return (
      <div
        className={"button-color-change"}
        onClick={() => {
          setColorPickerVisible(!colorPickerVisible);
          setColorPickerType(type);
        }}
        style={{
          backgroundColor: getStyleByKey(selected.style, type)
        }}
      >
        {content}
      </div>
    );
  };

  const updateCellColor = (type, color) => {
    graph.setCellStyles(type, color.hex);
  };
  const updateCellFont = (type, font) => {
    graph.setCellStyles(type, font)
  }

  const renderColorPicker = () =>
    colorPickerVisible &&
    selected &&
    selected.style && (
      <div>        
        <div className="toolbar-separator" />
        <CompactPicker
          color={getStyleByKey(selected.style, "fillColor")}
          onChange={color => {
            updateCellColor(colorPickerType, color);
          }}
        />
      </div>
    );


  const renderFontPicker = () => 
    selected &&
    selected.style && 
    (
      <div>
          <div className="toolbar-separator" />
          <NumberPicker
            max={30}
            min={1}
            value={activeFont}
            initialValue={20}
            onChange={value => {
              setTimeout(() => {
                setActiveFont(value);
                updateCellFont ('fontSize', `${value}px` );
              }, 500);
            }}
          />          
          <div className="toolbar-separator" />
        </div>
    );
  

  const onReaderLoad = e => {

    graph.removeCells(graph.getChildVertices(graph.getDefaultParent()));
    var json = JSON.parse(e.target.result);
    var options = { compact: true, ignoreComment: true, spaces: 4 };
    var xml = parser.js2xml(json.mxGraphModel, options);
    var doc = mxUtils.parseXml(xml);

    var codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());
    console.log(doc.documentElement, "=");
    var parent = graph.getDefaultParent();
    var elt = doc.documentElement.firstChild;
    var list = [];
    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      while (elt != null) {
        var cell = codec.decodeCell(elt);
        console.log(cell, list);

        if (cell && cell.vertex) {
          var geoData = cell.geometry.attributes;
          cell.geometry = {
            x: geoData.x.value,
            y: geoData.y.value,
            width: geoData.width.value,
            height: geoData.height.value
          };
          list.push(cell);
        } else if (cell && cell.edge) {
          cell.geometry = { x: 0, y: 0, width: 0, height: 0, relative: true };
          cell.edge = true;
          if (cell.target) {
            cell.target = list.filter(c => c.id === cell.target)[0];
            var i = list.length - 1;
            for (; i >= 0; i--) {
              if (list[i] && list[i].vertex && list[i].id !== cell.target) {
                cell.source = list[i];
                break;
              }
            }
          } else {
            var j = list.length - 1;
            for (; j >= 0; j--) {
              if (list[j] && list[j].vertex && !cell.target) {
                cell.target = list[j];
                continue;
              } else if (cell.target) {
                cell.source = list[j];
                break;
              }
            }
          }
          list.push(cell);
        }

        graph.refresh();
        elt = elt.nextSibling;
      }
      graph.addCells(list);
      console.log(list);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
    //setGraph(graph);
  };
  const fileChanged = function(event) {
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.onload = function(upload) {
      onReaderLoad(upload);
    }.bind(this);
    if (file) reader.readAsText(file);
  };

  return (
    <div className="mxgraph-container">
      <div className="mxgraph-toolbar-container">
        <div className="mxgraph-toolbar-container mxgraph-toolbar" ref={toolbarRef} />
        <div className="mxgraph-top-toolbar-container">
          {renderFontPicker()}
          {renderColorChange("fillColor")}
          {renderColorChange("fontColor", "T")}
          {renderColorChange("strokeColor", "|")}
          {renderColorPicker()}
        </div>
        <div
          className="mxgraph-bottom-toolbar-container"
          ref={bottomToolbarRef}
        />
      </div>
      <div
        ref={containerRef}
        className="mxgraph-drawing-container"
        style={{ height: props.height }}
      />
      <input
        type="file"
        name="upfile"
        id="upfile"
        onChange={fileChanged.bind(this)}
        style={{ display: "none" }}
      />
    </div>
  );
}
