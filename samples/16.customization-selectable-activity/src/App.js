import React from 'react';

import ReactWebChat from './WebChat';
import Inspector from './Inspector';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedActivity: null
    };
  }

  render() {
    const { selectedActivity } = this.state;

    return (
      <div className="app">
        <ReactWebChat activityMiddleware={ this.activityMiddleware } />
        <Inspector inspectedObject={ selectedActivity } />
      </div>
    )
  }

  activityMiddleware = () => next => card => children => {
    const selectedClass = card.activity === this.state.selectedActivity ? 'selected' : '';

    return (
      <div onClick={ this.selectActivity(card.activity) } className={ `activity-wrapper ${selectedClass}` }>
        { next(card)(children) }
      </div>
    )
  }

  selectActivity = (selectedActivity) => () => {
    this.setState({ selectedActivity });
  }
}
