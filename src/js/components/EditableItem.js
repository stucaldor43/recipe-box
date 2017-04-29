import React from 'react';
import { PropTypes as ReactPropTypes } from 'react';
import ReactDOM from 'react-dom';

const EditableItem = React.createClass({
    componentDidMount() {
      this.autoGrow();
      window.addEventListener("resize", this.autoGrow);
      setTimeout(this.props.transitionCallback, 0);
    },
    componentDidUpdate(prevProps, prevState) {
      if (this.props.value !== prevProps.value) {
        this.autoGrow();
      }
    },
    removeFocus(evt) {
      const element = ReactDOM.findDOMNode(this);
      if (evt.charCode === 13 || evt.key === "Enter") {
        element.blur();
        evt.preventDefault();
      }
    },
    autoGrow() {
      const element = ReactDOM.findDOMNode(this);
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    },
    render() {
      let domProps = {};
      if (this.props.isEditable) {
        (this.props.placeholder) ? domProps.placeholder = this.props.placeholder : null;
        (this.props.value) ? domProps.value = this.props.value : null;
      }
      else {
        domProps.disabled = "true";
        domProps.value = this.props.value;
      }
      
      return (
        <textarea className={ `editableItem ${(domProps.disabled) ? "editableItem-isNotBeingEdited" :"editableItem-isBeingEdited"}` }
                       { ...domProps }
                       onKeyPress={ this.removeFocus }
                       onChange={ this.props.onChangeHandler }
                       onBlur={ this.props.onBlurHandler }
                       ref={ this.props.refCallback }></textarea>
      );
    }
});

EditableItem.propTypes = {
  isEditable: ReactPropTypes.bool.isRequired,
  value: ReactPropTypes.string,
  placeholder: ReactPropTypes.string,
  onChangeHandler: ReactPropTypes.func,
  onBlurHandler: ReactPropTypes.func,
  refCallback: ReactPropTypes.func,
  transitionCallback: ReactPropTypes.func
};

EditableItem.defaultProps = {
  onChangeHandler: () => {},
  onBlurHandler: () => {},
  refCallback: () => {}
};

export default EditableItem;
