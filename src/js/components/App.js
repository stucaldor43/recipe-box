import React from 'react';
import RecipeList from './RecipeList';
import RecipeViewer from './RecipeViewer';
import RecipeCreatorModal from './RecipeCreatorModal';
import defaultRecipes from './../defaultRecipes';

const App = React.createClass({
    getInitialState() {
      return { modalActive: false, recipes: defaultRecipes, recipeBeingViewed: null };
    },
    componentDidMount() {
      if (this.getSavedRecipes()) {
        this.setState((state) => ({ recipes: this.getSavedRecipes() }));
      }
      this.ensureImagesAreCached();
    },
    componentDidUpdate() {
      (window.localStorage) ? window.localStorage.setItem("_user_recipes", JSON.stringify(this.state.recipes)) : null;
    },
    ensureImagesAreCached() {
      defaultRecipes.forEach((recipe) => new Image().src = recipe.background);
      new Image().src = "https://s-media-cache-ak0.pinimg.com/originals/91/e2/3e/91e23e865279a0d8a6ea23a87dea640c--homemade-mozzarella-sticks-mozzarella-cheese-sticks.jpg";
      new Image().src = "https://files.taxfoundation.org/20170110161620/meal2.jpg"
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
              const alteredRecipe = Object.assign({}, recipe);
              alteredRecipe.title = Object.assign({}, alteredRecipe.title, { name: newTitle });
              return alteredRecipe;
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
                const alteredRecipe = Object.assign({}, recipe);
                alteredRecipe.ingredients = alteredRecipe.ingredients.map((ingredient) => {
                  if (ingredient.id !== editedIngredient.id) {
                    return ingredient;  
                  }
                  return Object.assign({}, ingredient, { name: newIngredientValue});
                });
                return alteredRecipe;
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
              const alteredRecipe = Object.assign({}, recipe);
              alteredRecipe.ingredients = alteredRecipe.ingredients.filter((ingredient) => ingredient.id !== ingredientToDiscard.id);
              return alteredRecipe;
            }
            return recipe;
          })
        };
      });
    },
    addIngredient({ editedRecipe }, evt) {
      if (evt.charCode !== 13 && evt.key !== "Enter") { 
        return; 
      }
      const value = evt.target.value;
      this.setState((state) => {
        return {
          recipes: state.recipes.map((recipe) => {
            if (recipe === editedRecipe) {
              const id = (recipe.ingredients.length <= 0) ? 0 : recipe.ingredients[recipe.ingredients.length - 1].id + 1;
              const updatedRecipe = Object.assign({}, recipe);
              updatedRecipe.ingredients = updatedRecipe.ingredients.concat({ name: value, id });
              return updatedRecipe;
            }
            return recipe;
          })
        };
      });
      evt.target.value = "";
    },
    deleteRecipe(recipeToDelete) {
      this.setState((state) => {
        return {
          recipes: state.recipes.filter((recipe) => recipe.id !== recipeToDelete.id)
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
      this.setState({ recipeBeingViewed: recipe.id });
    },
    closeRecipeViewer() {
      this.setState({ recipeBeingViewed: null });
    },
    render() {
      let modalClassname = (this.state.modalActive) ? "show" : "hidden";
      const { recipeBeingViewed } = this.state;
      let recipeViewer;
      if (typeof recipeBeingViewed === "number") {
          recipeViewer = <RecipeViewer recipe={ this.state.recipes.find((recipe) => recipe.id === this.state.recipeBeingViewed) }
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

export default App;
