var React = require('react');
var Autosuggest = require('react-autosuggest');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var InputGroup = require('react-bootstrap/lib/InputGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var _suburbList = [];

function getSuggestions(value, state){
  const inputValue = value.toString().trim().toLowerCase();
  const inputLength  = inputValue.length;

  if (inputLength === 0 || inputLength === 1) return [];

  var suburbsByState = [];

  if (state.id != 0) {
    suburbsByState = _suburbList.filter(function(suburb) {
      if (suburb.state == state.name) { return true; }
      return false;
    })
  } else {
    suburbsByState = _suburbList;
  }

  var re = new RegExp(value, 'i');
  var suggestions = suburbsByState.filter(function(suburb) {
    return re.test(suburb.name) || re.test(suburb.postcode);
  });

  return suggestions;
}

function getSuggestionValue(suggestion) {
  return suggestion.postcode.toString();
}

function renderSuggestion(suggestion, { value, valueBeforeUpDown }) {
  var result = suggestion.name + ' (' + suggestion.postcode + ')';
  var val = valueBeforeUpDown == null ? value : valueBeforeUpDown;
  var index = result.toLowerCase().indexOf(val.toLowerCase());
  var display = [];
  display[0] = result.substring(0, index);
  display[1] = result.substring(index, index + val.length);
  display[2] = result.substring(index + val.length);
  
  return (
    <span>{display[0]}<b className="match-suggestion">{display[1]}</b>{display[2]}</span>
  );
}

var Search = React.createClass({

  getInitialState: function() {
    var defaultState = '';

    if (this.props.stateList && this.props.stateList.length > 0) {
      defaultState = this.props.stateList[0];
    }

    return {
      value: '',
      suggestions: getSuggestions('', ''),
      state: defaultState,
    };
  },

  componentDidMount: function() {
    _suburbList = this.props.suburbList;
  },

  componentDidUpdate: function() {
    _suburbList = this.props.suburbList;
  },

  _performSearch: function(value, state) {
    this.props.onSearch(value, state);

    document.getElementById('search-input').blur();
  },

  _onChange: function(event, { newValue }) {
    this.setState({
      value: newValue
    });
  },

  _onSuggestionsUpdatedRequested: function({ value }) {
    this.setState({
      suggestions: getSuggestions(value, this.state.state)
    });
  },

  _onSuggestionSelected: function(event, { suggestion, suggestionValue, sectionIndex, method }) {
    this._performSearch(suggestionValue, this.state.state);
  },

  _onSubmit: function(event) {
    event.preventDefault();

    this._performSearch(this.state.value, this.state.state);
  },

  _onStateSelected: function(eventKey, event) {
    this.setState({
      state: eventKey
    }, function(){ this._onSuggestionsUpdatedRequested({ value: this.state.value }) })
  },

  render: function() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: 'Type name or post code...',
      value,
      onChange: this._onChange,
      id: 'search-input'
    }

    var stateList = this.props.stateList.map(function(element, i){ return <MenuItem key={element.id} eventKey={element}>{element.name}</MenuItem> });

    return (
      <form id="search-form" className="form-horizontal" onSubmit={this._onSubmit}>
        <FormGroup>
          <div className="col-xs-12 col-md-8 col-md-offset-2">
            <InputGroup>
              <Autosuggest suggestions={suggestions}
                     onSuggestionsUpdateRequested={this._onSuggestionsUpdatedRequested}
                     getSuggestionValue={getSuggestionValue}
                     renderSuggestion={renderSuggestion}
                     inputProps={inputProps} 
                     onSuggestionSelected={this._onSuggestionSelected}/>
              <DropdownButton
                componentClass={InputGroup.Button}
                id="state-dropdown"
                title={this.state.state.name}
                pullRight
                onSelect={this._onStateSelected}
              >
                {stateList}
              </DropdownButton>
            </InputGroup>
          </div>
        </FormGroup> 
      </form>   
    )
  }
});

module.exports = Search;
