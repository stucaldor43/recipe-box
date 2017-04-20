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
            <section className="row">
              <div className="col-xs-12">
                <RecipeList openRecipeViewer={ this.openRecipeViewer } 
                  recipes={ this.state.recipes }>
                  { recipeViewer }
                </RecipeList>
                <button onClick={ this.openModal } className="btn btn-primary">Create Recipe</button>
              </div>
              { this.state.modalActive ? <RecipeCreatorModal addRecipe={ this.addRecipe } cName={ modalClassname } closeModal={ this.closeModal }/> : null }
            </section>
            );
        }
    });
    
    const RecipeCreatorModal = React.createClass({
        propTypes: {
          addRecipe: ReactPropTypes.func.isRequired,
          cName: ReactPropTypes.string.isRequired,
          closeModal: ReactPropTypes.func.isRequired
        },
        getInitialState() {
          return { ingredients: [], recipeTitle: "" };
        },
        componentDidMount() {
          this.ingredientNodes = [];
          this.setState((state) => { ingredients: state.ingredients.push({ value: "" }) });
        },
        addIngredientSlot() {
          this.setState((state) => { ingredients: state.ingredients.push({ value: "" }) });
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
            (el && el.value.trim().length > 0) ? ingredients.push(el.value.trim()) : null;
            return ingredients;
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
              <li>
                <label>Ingredient<input type="text" ref={(c) => {
                  if (this.ingredientNodes.indexOf(c) < 0) {
                    this.ingredientNodes.push(c);
                  }
                }} className="modal-ingredientInput"/></label>
                <button onClick={ this.removeIngredient.bind(this, i) }><i className="glyphicon glyphicon-trash"></i></button>
              </li>
            );
          });
          return ingredients;
        },
        render() {
          const { recipeTitle } = this.state;
          var saveButton;
          if (this.recipeInput && this.recipeInput.value.trim().length > 0) {
            saveButton = <button onClick={ this.saveRecipe } className="btn btn-success btn-default modal-saveRecipeButton">Save Recipe</button>;
          }
          else {
            saveButton = <button disabled="true" onClick={ this.saveRecipe } className="btn btn-success btn-default modal-saveRecipeButton">Save Recipe</button>;
          }
          
          return (
            <div className={ `${this.props.cName} modal` }>
              <div className="modal-header">
                <button className="modal-closeButton btn btn-default" onClick={ this.closeModal }><i className="glyphicon glyphicon-remove"></i></button>
              </div>
              <div className="modal-content">
                <ul>
                  <li className="modal-titleInputContainer">
                    <label htmlFor="recipeTitle">Title<input type="text" 
                    ref={(c) => this.recipeInput = c} value={ recipeTitle } onChange={ this.changeRecipeTitle } name="recipeTitle" className="modal-titleInput"/></label>
                  </li>
                  { this.renderIngredients() }
                  <li className="modal-addIngredientButtonContainer">
                    <button onClick={ this.addIngredientSlot } className="modal-addIngredientButton btn btn-default"><i className="glyphicon glyphicon-plus"></i>Add ingredient</button>
                  </li>
                </ul>
              </div>
              <div className="modal-footer">
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
        render() {
          let recipeTitle;
          let recipeIngredients;
          
          if (this.state.editableItemId === this.props.recipe.title.id) {
            recipeTitle = <div>
                            <input value={ this.props.recipe.title.name } onChange={ this.props.alterTitle.bind(this, this.props.recipe) } onBlur={ this.clearEditableItem } />
                          </div>;
          }
          else {
            recipeTitle = <div>
                            <span>{ this.props.recipe.title.name }</span>
                            <button onClick={ this.setEditableItem.bind(this, this.props.recipe.title) }><i className="glyphicon glyphicon-edit"></i></button>
                          </div>;
          }
          
          recipeIngredients = this.props.recipe.ingredients.map((ingredient, i) => {
            if (ingredient.id === this.state.editableItemId) {
              return (
                <li>
                  <input value={ ingredient.name } 
                         onChange={ this.props.alterIngredient.bind(this, { editedRecipe: this.props.recipe, editedIngredient: ingredient }) } 
                         onBlur={ this.clearEditableItem }/>  
                </li>
              );  
            }
            return (
              <li>
                <span>{ ingredient.name }</span>
                <button onClick={ this.setEditableItem.bind(this, ingredient) }><i className="glyphicon glyphicon-edit"></i></button>
                <button onClick={ this.props.removeIngredient.bind(this, { editedRecipe: this.props.recipe, ingredientToDiscard: ingredient }) }><i className="glyphicon glyphicon-remove-circle"></i></button>
              </li>
            );
          });
          const deleteRecipeButton = <button onClick={ this.deleteRecipe } className="btn btn-default">Delete Recipe</button>;
          
          return (
            <div>
              <div>
                <button onClick={ this.closeRecipeViewer }><i className="glyphicon glyphicon-remove"></i></button>
              </div>
              <div>
                { recipeTitle }
                <p>Ingredients:</p>
                <ul>
                  { recipeIngredients }
                </ul>
                <div>
                  <button onClick={ this.props.addIngredient.bind(this, { editedRecipe: this.props.recipe }) } 
                          className="btn btn-default">
                  <i className="glyphicon glyphicon-plus"></i>Add ingredient</button>
                </div>
              </div>
              <div>
                { deleteRecipeButton }
              </div>
            </div>
          );
        }  
    });
    
    function RecipeList(props) {
      const listOfRecipes = props.recipes.map((recipe, i) => {
        return (
          <li onClick={ props.openRecipeViewer.bind(this, recipe) }>
            <span>{ recipe.title.name }</span>
          </li>
        );
      });
        
      return (
        <div>
          <ul>
            { listOfRecipes }
          </ul>
          { props.children }
        </div>
      );
    }
    
    RecipeList.propTypes = {
      recipes: ReactPropTypes.array.isRequired,
      openRecipeViewer: ReactPropTypes.func.isRequired
    };
    
    const EditableItem = React.createClass({
        render() {
          let element;
          let domProps = {};
          if (this.props.isEditable) {
            (this.props.placeholder) ? domProps.placeholder = this.props.placeholder : null;
            (this.props.value) ? domProps.value = this.props.value : null;
          }
          else {
            domProps.disabled = "true";
            domProps.value = this.props.value;
            // element = <span>{ this.props.value }</span>;
          }
          element = <input type="text"
                           { ...domProps }
                           onChange={ this.props.onChangeHandler }
                           onBlur={ this.props.onBlurHandler }
                           ref={ this.props.refCallback }/>;
          
          return (
            <span>{ element }</span>  
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

