const Component = require('hui')
const html = require('hui/html')
const css = require('csjs')

const styles = css`
  .appContainer: {
    height: 100vh;
    width: 100vw;
  }
`

class App extends Component {
  createElement () {
    return html`<div class=${styles.appContainer}">
      Hey
    </div>`
  }
}

const app = new App()

document.querySelector('#app').appendChild(app.element)
