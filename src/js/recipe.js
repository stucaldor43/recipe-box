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
          window.localStorage.setItem("_user_recipes", JSON.stringify(this.state.recipes));
        },
        getSavedRecipes() {
          return JSON.parse(window.localStorage.getItem("_user_recipes"));
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
                <RecipeList renderingComponent={this} recipes={this.state.recipes} />
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
                  <label>Ingredient<input type="text" ref={(c) => this.ingredientNodes.push(c)} className="modal-ingredientInput"/></label>
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
    
    var RecipeEditorModal = React.createClass({
       getInitialState() {
         return {};
       },
       erase(field, e) {
        if (e.keyCode === 8) {
          let recipes = this.props.renderingComponentsParent.state.recipes;
          let recipe = recipes.filter((el) => el === this.props.editableRecipe);
          recipe[0][field] = recipe[0][field].slice(0, recipe[0][field].length - 1); 
          this.props.renderingComponentsParent.setState({recipes: recipes});
        }
       },
       updateInput(e) {
        let recipes = this.props.renderingComponentsParent.state.recipes;
        let recipe = recipes.filter((el) => el === this.props.editableRecipe);
        recipe[0].title += e.key; 
        this.props.renderingComponentsParent.setState({recipes: recipes});
       },
       updateTextArea(e) {
        const currentRecipe = this.props.renderingComponentsParent.state.recipes.filter((el) => el === this.props.editableRecipe );
        let recipes = this.props.renderingComponentsParent.state.recipes;
        let recipe = recipes.filter((el) => el === this.props.editableRecipe);
        recipe[0].ingredients += e.key; 
        this.props.renderingComponentsParent.setState({recipes: recipes});
        
        
       },
       render() {
         
         return (
          <div>
          <RecipeEditorDisplay parent={this} title={this.props.title} ingredients={this.props.ingredients}
          cName={this.props.cName} />
          </div>
         );
       }
    });
    
    var RecipeEditorDisplay = React.createClass({
      render() {
        return (
          <div className={this.props.cName}>
             <input onKeyDown={this.props.parent.erase.bind(this, "title")} onKeyPress={this.props.parent.updateInput} type="text" value={this.props.title}  /><br/>
             <textarea onKeyDown={this.props.parent.erase.bind(this, "ingredients")} onKeyPress={this.props.parent.updateTextArea} value={this.props.ingredients} style={{height: "200px"}}></textarea>
             <br/>
          </div>
        );
      }
    });
    
    const RecipeList = React.createClass({
       getInitialState() {
        return {editing: false, currentlyEditedRecipeIndex: undefined};   
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
       render() {
        const recipeTitleList = this.props.recipes
          .map((recipe, i) => (
            <li>
              { recipe.title }
              <button onClick={this.viewRecipe.bind(this, i)} className="btn btn-primary">View</button>
              <button className="btn btn-danger"
                onClick={this.deleteRecipe.bind(this, i)}>Delete</button>
            </li>));
        let editorModalClass = (this.state.editing) ? "show" : "hidden";
        let editableRecipe = (this.state.currentlyEditedRecipeIndex >= 0) ? this.props.renderingComponent.state
          .recipes[this.state.currentlyEditedRecipeIndex] : null;
        let recipeTitle = (editableRecipe) ? editableRecipe.title : "";
        let recipeIngredients = (editableRecipe) ? editableRecipe.ingredients : ""; 
        return (
            <ul>
              { recipeTitleList }
              <li>
                <RecipeEditorModal editableRecipe={editableRecipe} cName={editorModalClass} 
                  renderingComponentsParent={this.props.renderingComponent} 
                  title={recipeTitle} ingredients={recipeIngredients}/>
              </li>
            </ul>
            );   
       }
    });
    ReactDOM.render(<App />, document.querySelector("body"));
});

