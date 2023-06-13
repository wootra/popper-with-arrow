import { Tooltip } from "tooltip-with-arrow/src";
import "./App.css";
import "tooltip-with-arrow/dist/style.css";

function App() {
  return (
    <div id="root">
      <div className="card">
        <a href="www.google.com">With String body</a>
        <Tooltip body="test tooltip" />
      </div>
      <div className="card">
        <a href="www.google.com">With Element body</a>
        <Tooltip body={<div>test tooltip</div>} />
      </div>
      <div className="card">
        <a href="www.google.com">With Element body</a>
        <Tooltip>
          <div>test tooltip</div>
        </Tooltip>
      </div>
      <div className="card">
        <a href="www.google.com">Clickable</a>
        <Tooltip clickable>
          <div>test tooltip</div>
        </Tooltip>
      </div>
      <div className="card">
        <a href="www.google.com">top-end</a>
        <Tooltip placement="top-end">
          <div>test tooltip</div>
        </Tooltip>
      </div>
      <div className="card">
        <a href="www.google.com">top-start</a>
        <Tooltip placement="top-start">
          <div>test tooltip</div>
        </Tooltip>
      </div>
      <div className="card">
        <a href="www.google.com">top</a>
        <Tooltip placement="top">
          <div>test tooltip</div>
        </Tooltip>
      </div>
    </div>
  );
}

export default App;
