import React from 'react';

import ReactWebChat from './WebChat';
import Inspector from './Inspector';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedActivity: null
    };
    this.inspectorRef = React.createRef();
  }

  render() {
    const { selectedActivity } = this.state;

    return (
      <div className="app">
        <ReactWebChat activityMiddleware={ this.activityMiddleware } />
        <Inspector inspectedObject={ selectedActivity } inspectorRef={this.inspectorRef} />
      </div>
    )
  }

  activityMiddleware = () => next => card => children => {
    const isSelected = card.activity === this.state.selectedActivity;
    const selectedClass = isSelected ? 'selected' : '';
    const label = isSelected ? 'Selected activity. Click to deselect activity.' : 'Click to inspect activity.'

    return (
      <div
        aria-label={ label }
        className={ `activity-wrapper ${selectedClass}` }
        onClick={ this.selectActivity(card.activity) }
        onKeyDown={ this.handleKeyDown(card.activity) }
        role="button"
        tabIndex="0"
      >
        { next(card)(children) }
      </div>
    )
  }

  selectActivity = (selectedActivity) => () => {
    this.setState(prevState => ({
      selectedActivity: prevState.selectedActivity === selectedActivity ? null : selectedActivity
    }), () => {
      if (this.state.selectedActivity) {
        this.inspectorRef.current.focus();
      }
    });
  }

  handleKeyDown = (selectActivity) => (e) => {
    if ([' ', 'Enter'].includes(e.key)) {
      this.selectActivity(selectActivity)(e);
    }
  }
}
