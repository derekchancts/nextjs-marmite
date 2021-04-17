
import RecipeCard from '../components/RecipeCard.js'
import { createClient } from 'contentful'


export default function Recipes({ recipes }) {
  console.log(recipes)

  return (
    <div className="recipe-list">
      {recipes.map(recipe => (
        <RecipeCard key={recipe.sys.id} recipe={recipe} />
      ))}

      <style jsx>{`
        .recipe-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 20px 60px;
        }
      `}</style>
    </div>
  )
}


export async function getStaticProps() {

  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY,
  });

  const res = await client.getEntries({ content_type: 'receipe' });

  return {
    props: {
      recipes: res.items,
    },
    revalidate: 1    // INCREMENTAL STATIC REGENERATION
                     // will revalidate/refresh the page (if it has any updated data) after x seconds, "IF THE PAGE ALREADY EXISTS"
                     // after a user visits the page. so, subsequent users will see the updated page details
                     // if a new page is added, then the new page won't be "statically regenerated", unless 
                     // a "Fallback page" is used or set to true
                     // Fallback pages are placeholder content whilst Nextjs fetches new data for the page
  }
  
};





