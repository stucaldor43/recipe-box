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
              title: title,
              ingredients: ingredients,
              id: (recipes.length > 0) ? recipes[recipes.length - 1].id + 1 : null 
          }];
          this.setState((state) => ({ recipes: state.recipes.concat(newRecipes) }));
        },
        editRecipe({ editedRecipe, editedIngredientValue, editedIngredientIndex }) {
          this.setState((state) => {
            return {
              recipes: state.recipes.map((recipe, i) => {
                if (editedRecipe === recipe) {
                  if (editedIngredientValue) {
                    editedRecipe.ingredients[editedIngredientIndex] = editedIngredientValue;
                  }
                  else {
                    recipe.ingredients = recipe.ingredients.filter((ingredient, i) => (i !== editedIngredientIndex));  
                  }
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
                            editRecipe={ this.editRecipe }
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
    
    const MODE = {
      VIEW_MODE: "view mode",
      EDIT_MODE: "edit mode"
    };
    
    const RecipeViewer = React.createClass({
        propTypes: {
          recipeIndex: ReactPropTypes.number.isRequired,
          recipe: ReactPropTypes.object.isRequired,
          deleteRecipe: ReactPropTypes.func.isRequired,
          editRecipe: ReactPropTypes.func.isRequired,
          closeRecipeViewer: ReactPropTypes.func.isRequired
        },
        getInitialState() {
          return {
            mode: MODE.VIEW_MODE, 
            editedItemIndex: undefined, 
            editedItemValue: ""
          };
        },
        enterViewMode() {
          this.setState({ mode: MODE.VIEW_MODE });
        },
        enterEditMode() {
          this.setState({ mode: MODE.EDIT_MODE });
        },
        removeIngredient(indexToDelete) {
          this.props.editRecipe({
            editedRecipe: this.props.recipe, 
            editedIngredientValue: null, 
            editedIngredientIndex: indexToDelete
          });
        },
        deleteRecipe() {
          this.props.deleteRecipe(this.props.recipe);
          this.closeRecipeViewer();
        },
        setEditedItemIndex(index) {
          this.setState({ editedItemIndex: index, editedItemValue: this.props.recipe.ingredients[index] });
        },
        editIngredient(evt) {
          this.setState({ editedItemValue: evt.target.value });
        },
        alterIngredientValue(index) {
          this.props.editRecipe({
            editedRecipe: this.props.recipe, 
            editedIngredientValue: this.state.editedItemValue, 
            editedIngredientIndex: index
          });
          this.resetItemIndexAndValue();
        },
        resetItemIndexAndValue() {
          this.setState({
            editedItemIndex: undefined,
            editedItemValue: ""
          });
        },
        closeRecipeViewer() {
          this.props.closeRecipeViewer();
        },
        getIngredientListItems() {
          const listOfIngredients = this.props.recipe.ingredients.map((ingredient, i) => {
            let ingredientListItem;
            if (i === this.state.editedItemIndex) {
              ingredientListItem = <li>
                                     <input ref={(c) => (c) ? c.focus() : null} 
                                       onBlur={ this.alterIngredientValue.bind(this, i) } 
                                       onChange={ this.editIngredient } 
                                       type="text" 
                                       value={ this.state.editedItemValue }/>
                                   </li>;
            }
            else {
              ingredientListItem = <li>
                                     <span>{ ingredient }</span>
                                     <button onClick={ this.setEditedItemIndex.bind(this, i) }><i className="glyphicon glyphicon-edit"></i></button>
                                     <button onClick={ this.removeIngredient.bind(this, i) }><i className="glyphicon glyphicon-remove-circle"></i></button>
                                   </li>;
            }
            return ingredientListItem;
          });
          
          return listOfIngredients;
        },
        render() {
          const { mode } = this.state;
          const { recipe } = this.props;
          var recipeTitle;
          var recipeIngredients;
          var deleteRecipeButton;
          
          if (mode === MODE.VIEW_MODE) {
            recipeTitle = <div className="recipeTitleContainer"><span className="recipeTitle">{ recipe.title }</span></div>;
            recipeIngredients = recipe.ingredients.map((ingredient) => <li>{ ingredient }</li>);
            deleteRecipeButton = null;
          }
          else if (mode === MODE.EDIT_MODE) {
            recipeTitle = <div className="recipeTitleContainer"><span className="recipeTitle">{ recipe.title }</span></div>;
            recipeIngredients = this.getIngredientListItems();
            deleteRecipeButton = <button onClick={ this.deleteRecipe } className="btn btn-default">Delete Recipe</button>;
          }
          
          return (
            <div>
              <div>
                <button onClick={ this.closeRecipeViewer }><i className="glyphicon glyphicon-remove"></i></button>
              </div>
              <div>
                <button onClick={ this.enterViewMode }><i className="glyphicon glyphicon-eye-open"></i></button>
                <button onClick={ this.enterEditMode }><i className="glyphicon glyphicon-pencil"></i></button>
              </div>
              <div>
                { recipeTitle }
                <p>Ingredients:</p>
                <ul>
                  { recipeIngredients }
                </ul>
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
            <span>{ recipe.title }</span>
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
    
    ReactDOM.render(<App />, document.querySelector(".container-fluid"));
});

