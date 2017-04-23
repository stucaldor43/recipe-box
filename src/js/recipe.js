const {PropTypes: ReactPropTypes} = React;

window.addEventListener("load", function() {
    const App = React.createClass({
        getInitialState() {
          return { modalActive: false, recipes: [], recipeBeingViewed: null };
        },
        componentDidMount() {
          if (this.getSavedRecipes()) {
            this.setState((state) => ({ recipes: this.getSavedRecipes() }));
          }
        },
        componentDidUpdate() {
          (window.localStorage) ? window.localStorage.setItem("_user_recipes", JSON.stringify(this.state.recipes)) : null;
        },
        getSavedRecipes() {
          let savedRecipes = undefined;
          if (window.localStorage && window.localStorage.getItem("_user_recipes")) {
            savedRecipes = JSON.parse(window.localStorage.getItem("_user_recipes"));
          }
          return savedRecipes;
        },
        addRecipe(title, ingredients) {
          const { recipes } = this.state;
          const newRecipes = [{
              title: {
                name: title,
                id: 0
              },
              ingredients: ingredients.map((name, i) => ({ name, id: i + 1 }) ),
              id: (recipes.length > 0) ? recipes[recipes.length - 1].id + 1 : 0 
          }];
          this.setState((state) => ({ recipes: state.recipes.concat(newRecipes) }));
        },
        alterTitle(editedRecipe, evt) {
          const newTitle = evt.target.value;
          this.setState((state) => {
            return {
              recipes: state.recipes.map((recipe) => {
                if (recipe === editedRecipe) {
                  recipe.title.name = newTitle;
                  return recipe;
                }
                return recipe;
              })
            };
          });
        },
        alterIngredient({ editedRecipe, editedIngredient}, evt ) {
          const newIngredientValue = evt.target.value;
          this.setState((state) => {
            return {
              recipes: state.recipes.map((recipe) => {
                  if (recipe === editedRecipe) {
                    recipe.ingredients = editedRecipe.ingredients.map((ingredient) => {
                      if (ingredient.id === editedIngredient.id) {
                        ingredient.name = newIngredientValue;
                      } 
                      return ingredient;
                    });
                    return recipe;
                  }
                  return recipe;
              })
            };
          });
        },
        removeIngredient({ editedRecipe, ingredientToDiscard} ) {
          this.setState((state) => {
            return {
              recipes: state.recipes.map((recipe) => {
                if (recipe === editedRecipe) {
                  recipe.ingredients = editedRecipe.ingredients.filter((ingredient) => ingredient.id !== ingredientToDiscard.id);
                  return recipe;
                }
                return recipe;
              })
            };
          });
        },
        addIngredient({ editedRecipe }) {
          this.setState((state) => {
            return {
              recipes: state.recipes.map((recipe) => {
                if (recipe === editedRecipe) {
                  const id = (recipe.ingredients.length <= 0) ? 0 : editedRecipe.ingredients[editedRecipe.ingredients.length - 1].id + 1;
                  recipe.ingredients = editedRecipe.ingredients.concat({ name: "", id });
                } 
                return recipe;
              })
            };
          });
        },
        deleteRecipe(recipeToDelete) {
          this.setState((state) => {
            return {
              recipes: state.recipes.filter((recipe) => recipe !== recipeToDelete)
            };
          });
        },
        openModal() {
          this.setState({ modalActive: true });
        },
        closeModal() {
          this.setState({ modalActive: false });
        },
        openRecipeViewer(recipe) {
          this.setState({ recipeBeingViewed: recipe });
        },
        closeRecipeViewer() {
          this.setState({ recipeBeingViewed: null });
        },
        render() {
          let modalClassname = (this.state.modalActive) ? "show" : "hidden";
          const { recipeBeingViewed } = this.state;
          let recipeViewer;
          if (recipeBeingViewed) {
              recipeViewer = <RecipeViewer recipe={ recipeBeingViewed }
                            alterTitle={ this.alterTitle }
                            alterIngredient={ this.alterIngredient }
                            addIngredient={ this.addIngredient }
                            removeIngredient={ this.removeIngredient }
                            deleteRecipe={ this.deleteRecipe }
                            closeRecipeViewer={ this.closeRecipeViewer }/>;
          }
          else {
            recipeViewer = null;
          }
          
          return(
            <div className="container-inner">
              <RecipeList openRecipeViewer={ this.openRecipeViewer } 
                          recipes={ this.state.recipes }
                          openModal={ this.openModal }>
              </RecipeList>
              { recipeViewer }
              { this.state.modalActive ? <RecipeCreatorModal addRecipe={ this.addRecipe } classes={ modalClassname } closeModal={ this.closeModal }/> : null }
            </div>
            );
        }
    });
    
    const RecipeCreatorModal = React.createClass({
        propTypes: {
          addRecipe: ReactPropTypes.func.isRequired,
          classes: ReactPropTypes.string.isRequired,
          closeModal: ReactPropTypes.func.isRequired
        },
        getInitialState() {
          return { ingredients: [], recipeTitle: "" };
        },
        componentDidMount() {
          this.ingredientNodes = [];
          this.setState((state) => { 
            return {
              ingredients: state.ingredients.concat([{ value: "", id: 0 }]) 
            };
          });
        },
        addIngredientSlot() {
          this.setState((state) => { 
            return { 
              ingredients: state.ingredients.concat([{ 
                value: "", 
                id: state.ingredients[state.ingredients.length - 1].id + 1 
              }])
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
        renderIngredients() {
          const ingredients = this.state.ingredients.map((item, i) => {
            return (
              <li className="recipeCreatorModal-ingredientItem" key={ item.id }>
                <EditableItem isEditable={ true } 
                              placeholder="ingredient" 
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
                              Save Recipe</button>;
          
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
                <button onClick={ this.addIngredientSlot } className="recipeCreatorModal-addIngredientButton btn btn-default"><i className="glyphicon glyphicon-plus"></i>Add ingredient</button>
              </div>
              <div className="modal-footer recipeCreatorModal-footer">
                { saveButton }
              </div>
            </div>
          );
        }
    });
    
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
            editableItemId: null
          };
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
              refCallback: (c) => this[ingredient.id] = c
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
            
            return (
              <li className="recipeViewer-ingredientItem" data-index={ i + 1 } key={ ingredient.id }>
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
              </div>
              <div className="recipeViewer-footer">
                <button onClick={ this.props.addIngredient.bind(this, { editedRecipe: this.props.recipe }) } 
                        className="recipeViewer-addIngredientButton btn btn-default">
                  Add Ingredient</button>
                { deleteRecipeButton }
              </div>
            </div>
          );
        }  
    });
    
    function RecipeList(props) {
      const listOfRecipes = props.recipes.map((recipe, i) => {
        return (
          <li className="recipeList-recipeItem" 
              onClick={ props.openRecipeViewer.bind(this, recipe) } 
              key={ recipe.id }>
            <span className="recipeList-recipeTitle">{ recipe.title.name }</span>
          </li>
        );
      });
        
      return (
        <div className="recipeList">
          <div className="recipeList-shelf">
            <ul className="recipeList-itemList">
              { listOfRecipes }
            </ul>
          </div>
          <button onClick={ props.openModal } className="recipeList-createRecipeButton btn">Create Recipe</button>
        </div>
      );
    }
    
    RecipeList.propTypes = {
      recipes: ReactPropTypes.array.isRequired,
      openRecipeViewer: ReactPropTypes.func.isRequired,
      openModal: ReactPropTypes.func.isRequired
    };
    
    const EditableItem = React.createClass({
        componentDidMount() {
          this.autoGrow();
          window.addEventListener("resize", this.autoGrow);
        },
        componentDidUpdate(prevProps, prevState) {
          if (this.props.value !== prevProps.value) {
            this.autoGrow();
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
      refCallback: ReactPropTypes.func
    };
    
    EditableItem.defaultProps = {
      onChangeHandler: () => {},
      onBlurHandler: () => {},
      refCallback: () => {}
    };
    
    // const Button = React.createClass({
    //   render() {
    //     return (
    //       <button className={ `btn ${this.props.category}` } 
    //               onClick={ this.props.clickHandler }>{ this.props.children }</button>
    //     );
    //   }
    // });
    
    // Button.propTypes = {
    //   clickHandler: ReactPropTypes.func.isRequired,
    //   category: ReactPropTypes.oneOf(["primary", "danger"]).isRequired 
    // };
    
    ReactDOM.render(<App />, document.querySelector(".container-fluid"));
});

