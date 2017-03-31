const {PropTypes: ReactPropTypes} = React;

window.addEventListener("load", function() {
    const App = React.createClass({
        getInitialState() {
          return {modalActive: false, recipes: []};
        },
        componentWillMount() {
          if (this.getSavedRecipes()) {
            this.setState({
              recipes: this.getSavedRecipes()
            });
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
          let updatedRecipeList = this.state.recipes;
          updatedRecipeList.push({
              title: title,
              ingredients: ingredients
            });
          this.setState({
            recipes: updatedRecipeList
          });
        },
        editRecipe(editedRecipe) {
          this.setState({
            recipes: this.state.recipes.map((recipe) => (editedRecipe === recipe) ? editedRecipe : recipe)
          });
        },
        deleteRecipe(recipeToDelete) {
          this.setState({
            recipes: this.state.recipes.filter((recipe) => recipe !== recipeToDelete)
          });
        },
        openModal() {
          this.setState({modalActive: true});
        },
        closeModal() {
          this.setState({modalActive: false});
        },
        render() {
          let modalClassname = (this.state.modalActive) ? "show" : "hidden";
          
          return(
            <section className="row">
              <div className="col-xs-12">
                <RecipeList renderingComponent={this} recipes={this.state.recipes} editRecipe={this.editRecipe} deleteRecipe={this.deleteRecipe}/>
                <button onClick={this.openModal} className="btn btn-primary">Create Recipe</button>
              </div>
              {this.state.modalActive ? <RecipeCreatorModal renderingComponent={this} cName={modalClassname} closeModal={this.closeModal.bind(this)}/> : null}
            </section>
            );
        }
    });
    
    const RecipeCreatorModal = React.createClass({
        getInitialState() {
          return {ingredientCount: 1, indicesOfDeletedIngredients: []};
        },
        componentWillMount() {
          this.ingredientNodes = [];
          this.indicesOfDeletedIngredients = [];
        },
        addIngredientSlot() {
          this.setState({
            ingredientCount: this.state.ingredientCount + 1
          });
        },
        removeIngredient(index) {
          this.state.indicesOfDeletedIngredients.push(index);
          this.setState({
            indicesOfDeletedIngredients: this.state.indicesOfDeletedIngredients
          });
        },
        saveRecipe() {
          const ingredients = this.ingredientNodes.reduce((ingredients, el) => {
            (el) ? ingredients.push(el.value.trim()) : null;
            return ingredients;
          }, []);
          this.props.renderingComponent
            .addRecipe(this.recipeInput.value, ingredients);
          this.closeModal();
        },
        closeModal() {
          this.props.closeModal();
        },
        renderIngredients() {
          const ingredients = [];
          for (let i = 0; i < this.state.ingredientCount; i++) {
            if (this.state.indicesOfDeletedIngredients.indexOf(i) <= -1) {
              ingredients.push(
                <li>
                  <label>Ingredient<input type="text" ref={(c) => {
                    if (this.ingredientNodes.indexOf(c) < 0) {
                      this.ingredientNodes.push(c);
                    }
                  }} className="modal-ingredientInput"/></label>
                  <button onClick={this.removeIngredient.bind(this, i)}><i className="glyphicon glyphicon-trash"></i></button>
                </li>
              );
            }
          }
          return ingredients;
        },
        render() {
          return (
            <div className={`${this.props.cName} modal`}>
              <div className="modal-header">
                <button className="modal-closeButton btn btn-default" onClick={this.closeModal}><i className="glyphicon glyphicon-remove"></i></button>
              </div>
              <div className="modal-content">
                <ul>
                  <li className="modal-titleInputContainer">
                    <label htmlFor="recipeTitle">Title<input type="text" 
                    ref={(c) => this.recipeInput = c} name="recipeTitle" className="modal-titleInput"/></label>
                  </li>
                  {this.renderIngredients()}
                  <li className="modal-addIngredientButtonContainer">
                    <button onClick={this.addIngredientSlot} className="modal-addIngredientButton btn btn-default"><i className="glyphicon glyphicon-plus"></i>Add ingredient</button>
                  </li>
                </ul>
              </div>
              <div className="modal-footer">
                <button onClick={this.saveRecipe} className="btn btn-success btn-default modal-saveRecipeButton">Save Recipe</button>
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
          this.setState({mode: MODE.VIEW_MODE});
        },
        enterEditMode() {
          this.setState({mode: MODE.EDIT_MODE});
        },
        removeIngredient(ingredientIndex) {
          this.props.recipe.ingredients = this.props.recipe.ingredients.filter((ingredient, i) => i !== ingredientIndex);
          this.props.editRecipe(this.props.recipe);
        },
        deleteRecipe() {
          this.props.deleteRecipe(this.props.recipe);
          this.closeRecipeViewer();
        },
        setEditedItemIndex(index) {
          this.setState({editedItemIndex: index, editedItemValue: this.props.recipe.ingredients[index]});
        },
        editIngredient(evt) {
          this.setState({editedItemValue: evt.target.value});
        },
        saveIngredientChanges(index) {
          this.props.recipe.ingredients[index] = this.state.editedItemValue;
          this.props.editRecipe(this.props.recipe);
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
                                     <input ref={(c) => (c) ? c.focus() : null} onBlur={this.saveIngredientChanges.bind(this, i)} onChange={this.editIngredient} type="text" value={this.state.editedItemValue}/>
                                   </li>;
            }
            else {
              ingredientListItem = <li>
                                     <span>{ingredient}</span>
                                     <button onClick={this.setEditedItemIndex.bind(this, i)}><i className="glyphicon glyphicon-edit"></i></button>
                                     <button onClick={this.removeIngredient.bind(this, i)}><i className="glyphicon glyphicon-remove-circle"></i></button>
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
            recipeTitle = <div className="recipeTitleContainer"><span className="recipeTitle">{recipe.title}</span></div>;
            recipeIngredients = recipe.ingredients.map((ingredient) => <li>{ingredient}</li>);
            deleteRecipeButton = null;
          }
          else if (mode === MODE.EDIT_MODE) {
            recipeTitle = <div className="recipeTitleContainer"><span className="recipeTitle">{recipe.title}</span></div>;
            recipeIngredients = this.getIngredientListItems();
            deleteRecipeButton = <button onClick={this.deleteRecipe} className="btn btn-default">Delete Recipe</button>;
          }
          
          return (
            <div>
              <div>
                <button onClick={this.closeRecipeViewer}><i className="glyphicon glyphicon-remove"></i></button>
              </div>
              <div>
                <button onClick={this.enterViewMode}><i className="glyphicon glyphicon-eye-open"></i></button>
                <button onClick={this.enterEditMode}><i className="glyphicon glyphicon-pencil"></i></button>
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
    
    const RecipeList = React.createClass({
       getInitialState() {
        return {editing: false, currentlyEditedRecipeIndex: undefined, isRecipeViewerOpen: false};   
       },
       viewRecipe(index) {
         this.props.renderingComponent.setState({modalActive: false});
         this.setState({currentlyEditedRecipeIndex: index, editing: true});
       },
       deleteRecipe(indexOfDeletion) {
         var removeSelected = function(elem, i, arr) {
           return i !== indexOfDeletion;
         }
         this.props.renderingComponent.setState({
           recipes: this.props.renderingComponent.state.recipes
             .filter(removeSelected)
         });
       },
       openRecipeViewer(index) {
         this.setState({
           currentlyEditedRecipeIndex: index, 
           isRecipeViewerOpen: true
         });
       },
       closeRecipeViewer() {
         this.setState({isRecipeViewerOpen: false});
       },
       renderListOfRecipes() {
        return this.props.recipes.map((recipe, i) => {
          return (
            <li onClick={this.openRecipeViewer.bind(this, i)}>
              <span>{ recipe.title }</span>
            </li>
          );
        });
       },
       render() {
        const {currentlyEditedRecipeIndex, isRecipeViewerOpen} = this.state;
        const {recipes, editRecipe, deleteRecipe} = this.props;
        const recipe = recipes[currentlyEditedRecipeIndex];
        let recipeViewer;
        
        if (isRecipeViewerOpen) {
          recipeViewer = <RecipeViewer 
                            recipeIndex={currentlyEditedRecipeIndex} 
                            recipe={recipe} 
                            editRecipe={editRecipe}
                            deleteRecipe={deleteRecipe}
                            closeRecipeViewer={this.closeRecipeViewer}/>;
        }
        else {
          recipeViewer = null;
        }
        
        return (
          <div>
            <ul>
              {this.renderListOfRecipes()}
            </ul>
            {recipeViewer}
          </div>
        );
       }
    });
    ReactDOM.render(<App />, document.querySelector(".container-fluid"));
});

