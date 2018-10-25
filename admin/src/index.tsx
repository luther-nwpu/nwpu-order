import * as React from "react"
import * as ReactDOM from "react-dom"
import App from "@layout/app/App"
import registerServiceWorker from "@config/registerServiceWorker"

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement)
registerServiceWorker()
