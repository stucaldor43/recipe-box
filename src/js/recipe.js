window.addEventListener("load", function() {
    const ListContainer = React.createClass({
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
          this.setState({modalActive: !this.state.modalActive});
        },
        render() {
          let modalClassname = (this.state.modalActive) ? "show" : "hidden";
          
          return(
            <section className="row">
              <div className="col-xs-12">
                <RecipeList renderingComponent={this} recipes={this.state.recipes} />
                <button onClick={this.openModal} className="btn btn-primary">Create Recipe</button>
              </div>
              <RecipeCreatorModal renderingComponent={this} cName={modalClassname} />
            </section>
            );
        }
    });
    
    const RecipeCreatorModal = React.createClass({
        getInitialState() {
          return {};
        },
        saveRecipe() {
          let ingredients = this.textarea.value.split(",")
            .map((item) => item.trim());
          this.props.renderingComponent
            .addRecipe(this.recipeInput.value, ingredients);
          
        },
        render() {
          const textareaDefaultValue = "Enter ingredients here(space" + 
          " delimited by a comma except for the last ingredient)" + 
          "\n ex: onions, lettuce, tomatoes"; 
          
          return (
            <div className={this.props.cName}>
              <ul>
                <li>
                  <label htmlFor="recipeTitle">Title<input type="text" 
                    ref={(c) => this.recipeInput = c} name="recipeTitle"/></label>
                </li>
                <li>
                  <textarea defaultValue={textareaDefaultValue} 
                    ref={(c) => this.textarea = c}>
                    
                  </textarea>
                </li>
                <li>
                  <button onClick={this.saveRecipe} className="btn btn-success">Save Recipe</button>
                </li>
              </ul>
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
    
    /* 
    <div className={this.props.cName}>
             <label htmlFor="title">Title<input type="text" 
             onChange={this.updateField} name="title" value={this.props.title} /></label><br/>
             <label htmlFor="">Ingredients<textarea 
             value="fd"></textarea></label>
             <br/>
             <button className="btn btn-primary">Save Changes</button>
             <button className="btn btn-danger">Discard Changes</button>
           </div>
    */
    
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
    
    const RecipeItem = React.createClass({
      getInitialState() {
        return {};   
      },
      render() {
        const ingredientList = this.props.ingredients.map(
          (item) => <li>{ item }</li>);   
        return(
            <article>
                <h2>
                  { this.props.name }
                </h2>
                <ul>
                  { ingredientList }
                </ul>
            </article>
            );    
        
        
      }
    });
    
    ReactDOM.render(<ListContainer />, document.querySelector("body"));
});

