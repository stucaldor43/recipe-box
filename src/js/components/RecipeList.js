import React from 'react';
import { PropTypes as ReactPropTypes } from 'react';

const RecipeList = (props) => {
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
};

RecipeList.propTypes = {
  recipes: ReactPropTypes.array.isRequired,
  openRecipeViewer: ReactPropTypes.func.isRequired,
  openModal: ReactPropTypes.func.isRequired
};

export default RecipeList;
