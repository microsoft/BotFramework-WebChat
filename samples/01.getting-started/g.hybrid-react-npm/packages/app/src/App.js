import React from 'react';

import ChatComponentWrapper from './ChatComponentWrapper';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.handleDarkBackgroundButtonClick = this.handleDarkBackgroundButtonClick.bind(this);
    this.handleLightBackgroundButtonClick = this.handleLightBackgroundButtonClick.bind(this);

    this.state = {
      styleOptions: {}
    };
  }

  handleDarkBackgroundButtonClick() {
    this.setState(() => ({
      styleOptions: {
        backgroundColor: 'black'
      }
    }));
  }

  handleLightBackgroundButtonClick() {
    this.setState(() => ({
      styleOptions: {}
    }));
  }

  render() {
    const {
      state: { styleOptions }
    } = this;

    return (
      <section>
        <header>Hosting app is running React {React.version}</header>
        <div className="react-container">
          <div className="command-bar">
            <button onClick={this.handleLightBackgroundButtonClick} type="button">
              Light background
            </button>
            <button onClick={this.handleDarkBackgroundButtonClick} type="button">
              Dark background
            </button>
          </div>
          <ChatComponentWrapper styleOptions={styleOptions} />
        </div>
      </section>
    );
  }
}

export default App;
