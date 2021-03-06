import { createClient } from 'contentful';
import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Skeleton from '../../components/Skeleton';


const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
});


export default function RecipeDetails({ recipe }) {

  // after we set the fallback to true, it will use the getStaticPaths and try to generate a "temp" page until
  // the new page / data is fetched and generated. 
  // if (!recipe) return <div>Loading...</div>
  if (!recipe) return <Skeleton />

  const { featuredImage, title, cookingTime, ingredients, method } = recipe.fields;

  return (
    <div>
      <div className="banner">
        <Image 
          src={'https:' + featuredImage.fields.file.url}
          alt={title}
          width={featuredImage.fields.file.details.image.width * 4}
          height={featuredImage.fields.file.details.image.height * 4}
        />
        <h2>{title}</h2>
      </div>

      <div className="info">
        <p>Take about {cookingTime} mins to cook.</p>
        <h3>Ingredients: </h3>
        {ingredients && ingredients.map((ingredient, index) => (
          <span key={index}> {ingredient} </span>
        ))}
      </div>

      <div className="method">
        <h3>Method:</h3>
        <div>{documentToReactComponents(method)}</div>
      </div>

      <style jsx>{`
        h2,h3 {
          text-transform: uppercase;
        }

        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          // transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0,0,0,0.1);
        }

        .info p {
          margin: 0;
        }

        .info span::after {
          content: ", ";
        }

        .info span:last-child::after {
          content: ".";
        }
      `}</style>

    </div>
  )
};



export const getStaticPaths = async () => {
  // const client = createClient({
  //   space: process.env.CONTENTFUL_SPACE_ID,
  //   accessToken: process.env.CONTENTFUL_ACCESS_KEY,
  // });

  const res = await client.getEntries({ content_type: 'receipe' });

  const paths = res.items.map(item => {
    return {
      params: { slug: item.fields.slug }
    }
  })

  return {
    // paths [{params: { slug: slug }}, {}, {}]  - an array of objects
    // nextjs will know which pages will need to be generated based on the paths
    paths,
    //fallback: false  // if fallback is set to false, then we will get the 404 page
    fallback: true
  }
};



// Will get the items / item and then be injected as a prop into a page
// For each of the paths generated under getStaticPaths, it will run getStaticProps each time
export async function getStaticProps(context) {
  const slug = context.params.slug;     // params: { slug: item.fields.slug } from getStaticPaths

  // const client = createClient({
  //   space: process.env.CONTENTFUL_SPACE_ID,
  //   accessToken: process.env.CONTENTFUL_ACCESS_KEY,
  // });

  // this returns an array even though there's only 1 item inside it
  const res = await client.getEntries({ 
    content_type: 'receipe',
    'fields.slug': slug
  });

  // if we cannot finf the item / slug
  if (!res.items.length) {
    return {
      redirect: {
        destination: '/',
        permanent: false  // we might have the slug in the future. So, set permanent redirect to false here 
      }
    }
  };

  return {
    props: {
      recipe: res.items[0],
    },
    revalidate: 1    // INCREMENTAL STATIC REGENERATION
                     // will revalidate/refresh the page (if it has any updated data) after x seconds, "IF THE PAGE ALREADY EXISTS"
                     // after a user visits the page. so, subsequent users will see the updated page details
                     // if a new page is added, then the new page won't be "statically regenerated", unless
                     // a "Fallback page" is used or set to true. 
                     // Fallback pages are placeholder content whilst Nextjs fetches new data for the page
    
                     
  }
  
};

