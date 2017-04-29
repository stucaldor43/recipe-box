import React from 'react';
import { PropTypes as ReactPropTypes } from 'react';
import EditableItem from './EditableItem';

const RecipeCreatorModal = React.createClass({
    propTypes: {
      addRecipe: ReactPropTypes.func.isRequired,
      classes: ReactPropTypes.string.isRequired,
      closeModal: ReactPropTypes.func.isRequired
    },
    getInitialState() {
      return { ingredients: [], recipeTitle: "", hiddenItemIds: [] };
    },
    componentDidMount() {
      this.ingredientNodes = [];
    },
    addIngredientSlot(evt) {
      const value = evt.target.value;
      if (evt.charCode === 13 || evt.key === "Enter") {
        this.setState((state) => {
          const id = (state.ingredients.length <= 0) ? 0 : state.ingredients[state.ingredients.length - 1].id + 1;
          return { 
            ingredients: state.ingredients.concat([{ 
              value, 
              id  
            }]),
            hiddenItemIds: state.hiddenItemIds.concat(id)
          };
        });
        evt.target.value = "";
      }
    },
    changeIngredient(alteredIngredientId, evt) {
      const value = evt.target.value;
      this.setState((state) => {
        return {
          ingredients: state.ingredients.map((item, i) => {
            if (item.id === alteredIngredientId) {
              return (Object.assign({}, item, { value }));
            }
            return item;
          })
        };
      });
    },
    removeIngredient(indexOfIngredientToDelete) {
      this.setState((state) => { 
        return { 
          ingredients: state.ingredients.filter((item, i) => !(i === indexOfIngredientToDelete)) 
        };
      });
    },
    saveRecipe() {
      const ingredients = this.ingredientNodes.reduce((ingredients, el) => {
        return (el && el.value.trim().length > 0) ? ingredients.concat([el.value.trim()]) : ingredients;
      }, []);
      this.props.addRecipe(this.recipeInput.value, ingredients);
      this.closeModal();
    },
    closeModal() {
      this.props.closeModal();
    },
    changeRecipeTitle(evt) {
      this.setState({ recipeTitle: evt.target.value });
    },
    revealItem(removedItemId) {
      this.setState((state) => {
        return {
          hiddenItemIds: state.hiddenItemIds.filter((id) => id !== removedItemId) 
        };
      });
    },
    renderIngredients() {
      const ingredients = this.state.ingredients.map((item, i) => {
        let domProps = {
          transitionCallback: this.revealItem.bind(this, item.id)
        };
        (item.value.trim().length > 0) ? domProps.value = item.value : null;
        
        const isHidden = (this.state.hiddenItemIds.includes(item.id) ? true : false);
        
        return (
          <li className={ `recipeCreatorModal-ingredientItem ${isHidden ? "recipeCreatorModal-ingredientItem-isHidden" : ""}` } 
              key={ item.id } 
              data-index={ i + 1 }>
            <EditableItem isEditable={ true }
                          { ...domProps }
                          placeholder="ingredient"
                          onChangeHandler={ this.changeIngredient.bind(this, item.id) }
                          refCallback={(c) => {
                           if (this.ingredientNodes.indexOf(c) < 0) {
                             this.ingredientNodes.push(c);
                           }
                         }}/>
            <button className="recipeCreatorModal-deleteIngredientButton" 
                    onClick={ this.removeIngredient.bind(this, i) }>
              <i className="glyphicon glyphicon-trash"></i>
            </button>
          </li>
        );
      });
      return ingredients;
    },
    render() {
      const { recipeTitle } = this.state;
      let saveButton;
      let domProps = (!(this.recipeInput && this.recipeInput.value.trim().length > 0)) ? { disabled: "true" } : {};
      saveButton = <button { ...domProps } 
                          onClick={ this.saveRecipe } 
                          className="btn btn-success btn-default recipeCreatorModal-saveRecipeButton">
                          { (this.recipeInput && this.recipeInput.value.trim().length > 0) ? 'Save Recipe' : 'A title is required' }</button>;
      
      return (
        <div className={ `${this.props.classes} modal recipeCreatorModal` }>
          <div className="modal-header recipeCreatorModal-header">
            <button className="recipeCreatorModal-closeButton close glyphicon glyphicon-remove" 
                    onClick={ this.closeModal }></button>
          </div>
          <div className="modal-content recipeCreatorModal-content">
            <div className="recipeCreatorModal-titleContainer">
              <EditableItem isEditable={ true } 
                            value={ recipeTitle } 
                            placeholder="title" 
                            refCallback={(c) => this.recipeInput = c}
                            onChangeHandler={ this.changeRecipeTitle }/>
            </div>
            <ul className="recipeCreatorModal-ingredientList">
              { this.renderIngredients() }
            </ul>
            <input onKeyPress={ this.addIngredientSlot } 
                   className="recipeCreatorModal-addIngredientTextbox" 
                   placeholder="add ingredient"/>
          </div>
          <div className="modal-footer recipeCreatorModal-footer">
            { saveButton }
          </div>
        </div>
      );
    }
});

export default RecipeCreatorModal;