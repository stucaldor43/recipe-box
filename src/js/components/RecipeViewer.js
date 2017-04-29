import React from 'react';
import { PropTypes as ReactPropTypes } from 'react';
import EditableItem from './EditableItem';

const RecipeViewer = React.createClass({
    propTypes: {
      recipe: ReactPropTypes.object.isRequired,
      alterTitle: ReactPropTypes.func.isRequired,
      alterIngredient: ReactPropTypes.func.isRequired,
      addIngredient: ReactPropTypes.func.isRequired,
      removeIngredient: ReactPropTypes.func.isRequired,
      deleteRecipe: ReactPropTypes.func.isRequired,
      closeRecipeViewer: ReactPropTypes.func.isRequired
    },
    getInitialState() {
      return {
        editableItemId: null,
        hiddenItemIds: []
      };
    },
    componentDidMount() {
      const defaultRecipeBackground = "https://files.taxfoundation.org/20170110161620/meal2.jpg";
      document.querySelector(".recipeViewer-header").style.backgroundImage = `url(${this.props.recipe.background || defaultRecipeBackground})`;
    },
    componentWillReceiveProps(nextProps) {
      if (nextProps.recipe.ingredients.length > this.props.recipe.ingredients.length) {
        this.setState((state) => {
          const ingredients = nextProps.recipe.ingredients;
          return {
            hiddenItemIds: state.hiddenItemIds.concat(ingredients[ingredients.length - 1].id)
          };
        });
      }
      if (this.props.recipe.background !== nextProps.recipe.background) {
        const defaultRecipeBackground = "https://files.taxfoundation.org/20170110161620/meal2.jpg";
        document.querySelector(".recipeViewer-header").style.backgroundImage = `url(${nextProps.recipe.background || defaultRecipeBackground})`;
      }
    },
    componentDidUpdate(prevProps, prevState) {
      const editButtonWasRecentlyClicked = prevState.editableItemId !== this.state.editableItemId && 
                                           typeof this.state.editableItemId === "number";
      if (editButtonWasRecentlyClicked) {
        this[this.state.editableItemId].focus();
      }
    },
    deleteRecipe() {
      this.props.deleteRecipe(this.props.recipe);
      this.closeRecipeViewer();
    },
    setEditableItem(item) {
      this.setState({ editableItemId: item.id });
    },
    clearEditableItem() {
      this.setState({ editableItemId: null });
    },
    closeRecipeViewer() {
      this.props.closeRecipeViewer();
    },
    revealItem(removedItemId) {
      this.setState((state) => {
        return {
          hiddenItemIds: state.hiddenItemIds.filter((id) => id !== removedItemId) 
        };
      });
    },
    renderTitleInput() {
      let recipeTitle, editButton;
      let domProps = {
        refCallback: (c) => this[this.props.recipe.title.id] = c
      };
      if (this.state.editableItemId === this.props.recipe.title.id) {
        domProps.isEditable = true;
        domProps.value = this.props.recipe.title.name;
        domProps.onChangeHandler = this.props.alterTitle.bind(this, this.props.recipe);
        domProps.onBlurHandler = this.clearEditableItem;
        editButton = null;
      }
      else {
        domProps.isEditable = false;
        domProps.value = this.props.recipe.title.name; 
        editButton = <button className="recipeViewer-editTitleButton" 
                             onClick={ this.setEditableItem.bind(this, this.props.recipe.title) }>
                        <i className="glyphicon glyphicon-edit"></i>
                     </button>;
      }
      recipeTitle = <div className="recipeViewer-titleContainer">
                      <EditableItem { ...domProps }/>{ editButton }
                    </div>;
      return recipeTitle;
    },
    renderIngredientInputs() {
      let recipeIngredients;
      recipeIngredients = this.props.recipe.ingredients.map((ingredient, i) => {
        let buttons;
        let domProps = {
          value: ingredient.name,
          refCallback: (c) => this[ingredient.id] = c,
          transitionCallback: this.revealItem.bind(this, ingredient.id)
        };
        if (ingredient.id === this.state.editableItemId) {
          domProps.isEditable = true;
          domProps.onChangeHandler = this.props.alterIngredient.bind(this, { editedRecipe: this.props.recipe, editedIngredient: ingredient });
          domProps.onBlurHandler = this.clearEditableItem;
          buttons = null;
        }
        else {
          domProps.isEditable = false;
          buttons = <span className="recipeViewer-ingredientActions">
                      <button className="recipeViewer-editIngredientButton" 
                              onClick={ this.setEditableItem.bind(this, ingredient) }>
                        <i className="glyphicon glyphicon-edit"></i>
                      </button>
                      <button className="recipeViewer-deleteIngredientButton" 
                              onClick={ this.props.removeIngredient.bind(this, { editedRecipe: this.props.recipe, ingredientToDiscard: ingredient }) }>
                        <i className="glyphicon glyphicon-remove-circle"></i>
                      </button>
                    </span>;
        }
        const isHidden = (this.state.hiddenItemIds.includes(ingredient.id) ? true : false);
        return (
          <li className={ `recipeViewer-ingredientItem ${isHidden ? "recipeViewer-ingredientItem-isHidden" : ""}`} 
              data-index={ i + 1 } 
              key={ ingredient.id }>
            <EditableItem { ...domProps }/>{ buttons }
          </li>
        );
      });
      return recipeIngredients;
    },
    render() {
      const deleteRecipeButton = <button onClick={ this.deleteRecipe } className="recipeViewer-deleteRecipeButton btn btn-default">Delete Recipe</button>;
      
      return (
        <div className="recipeViewer">
          <div className="recipeViewer-header">
            <button className="recipeViewer-closeButton close" 
                    onClick={ this.closeRecipeViewer }>
              <i className="glyphicon glyphicon-remove"></i>
            </button>
          </div>
          <div className="recipeViewer-content">
            { this.renderTitleInput() }
            <p>Ingredients:</p>
            <ul className="recipeViewer-ingredientList">
              { this.renderIngredientInputs() }
            </ul>
            <input onKeyPress={ this.props.addIngredient.bind(null, { editedRecipe: this.props.recipe }) } 
                   className="recipeViewer-addIngredientTextbox"
                   placeholder="add ingredient"/>
          </div>
          <div className="recipeViewer-footer">
            { deleteRecipeButton }
          </div>
        </div>
      );
    }  
});

export default RecipeViewer;
