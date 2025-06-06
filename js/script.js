const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`
const DETAILS_URL = `${BASE_URL}lookup.php?i=`

searchBtn.addEventListener("click", searchMeals);
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", ()=>{
    mealDetails.classList.add("hidden");
})

searchBox.addEventListener("keyup", (e)=>{
    if(e.key === "Enter"){
        searchMeals();
    }
});

// Fetch meals from API
async function searchMeals(){
    const searchTerm = searchBox.value.trim();

    // Handling the edge case
    if(!searchTerm){
        errorContainer.textContent="Please enter a search term";
        errorContainer.classList.remove("hidden");
        return;
    }
    try{
        resultHeading.textContent = `Searching for ${searchTerm}...`;
        mealsContainer.innerHTML = "";
        errorContainer.classList.add("hidden");

        const response = await fetch(`${SEARCH_URL}${searchTerm}`);
        const data = await response.json();
        console.log(data);
        
        // No meals found
        if(data.meals===null){
            resultHeading.textContent = "";
            mealsContainer.innerHTML = "";
            errorContainer.textContent = `No recipes found for ${searchTerm}. Please try another search term!`;
            errorContainer.classList.remove("hidden");
        }
        else{
            resultHeading.textContent = `Search results for ${searchTerm}:`;
            displayMeals(data.meals);
            searchBox.value = "";
        }
    }
    catch(error){
        errorContainer.textContent = "Something went wrong. Please try again later.";
        errorContainer.classList.remove("hidden");
    }
}

function displayMeals(meals){
    mealsContainer.innerHTML = "";

    meals.forEach((meal)=>{
        mealsContainer.innerHTML +=`
        <div class="meal" data-meal-id="${meal.idMeal}">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-info">
                <h3 class="meal-title">${meal.strMeal}</h3>
                ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>`:""}
            </div>
        </div>`
    });
}

async function handleMealClick(event){
    const mealElement = event.target.closest(".meal");

    if(!mealElement) return;

    const mealId = mealElement.getAttribute("data-meal-id");

    try{
        const response = await fetch(`${DETAILS_URL}${mealId}`);
        const data = await response.json();

        console.log(data);

        if(data.meals && data.meals[0]){
            const meal = data.meals[0];

            const ingredients = [];

            for(let i=1; i<=20; i++){
                if(meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim()!==""){
                    ingredients.push({
                        ingredient: meal[`strIngredient${i}`],
                        measure: meal[`strMeasure${i}`] 
                    });
                }
            }

            mealDetailContent.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
                <h2 class="meal-details-title">${meal.strMeal}</h2>
                <div class="meal-details-category">
                    <span>${meal.strCategory || "Uncategorized"}</span>
                </div>
                <div class="meal-details-instructions">
                    <h3>Instructions</h3>
                    <p>${meal.strInstructions}</p>
                </div>
                <div class="meal-details-ingredients">
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${
                            ingredients.map((item)=>`<li><i class="fa-solid fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>`).join("")
                        }
                    </ul>
                </div>
                ${
                    meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="youtube-link">
                        <i class="fab fa-youtube"></i> Watch Video
                    </a>` : ""
                }
            `;
            mealDetails.classList.remove("hidden");
            mealDetails.scrollIntoView({behavior:"smooth"});
        }
    }
    catch(error){
        errorContainer.textContent = "Could not load recipe details. Please try again later.";
        errorContainer.classList.remove("hidden");
        console.error("Error loading meal details:", error);
    }
}